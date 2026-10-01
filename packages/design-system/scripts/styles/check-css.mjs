#!/usr/bin/env node
// Static stylesheet gate (TDD CSS delivery, "Compile and assemble" step 4;
// STD-GLB-FE-005 sections 3.3-3.4; STD-UIP-STY-001 cascade contract). Rejects:
// - a stylesheet that does not open with the canonical layer order;
// - any style rule outside a canonical layer, a nested or undeclared layer;
// - selectors outside the allowed scope of their layer;
// - var() references to custom properties that are neither emitted tokens,
//   declared in the same stylesheet, nor documented runtime properties;
// - a selector/property pair owned by both Sass components and Panda recipes;
// - raw values (STD-GLB-FE-005 sections 3.2 and 3.4): integer z-index, color
//   literals, ad-hoc custom properties, and !important, unless
//   styles.config.json records the exception. An exception no rule uses fails.
//
//   node scripts/styles/check-css.mjs --dist <dir>   check the built assets
//   node scripts/styles/check-css.mjs --self-test    prove each rule rejects

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as csstree from "css-tree";
import { LAYERS, LAYER_STATEMENT } from "./layers.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const CONFIG_KEYS = {
  root: ["schemaVersion", "aggregate", "themeRoot", "recipes", "runtimeProperties", "exceptions"],
  aggregate: ["source", "publish"],
  runtimeProperty: ["owner", "purpose"],
  exception: ["rule", "selector", "properties", "standard", "reason", "removal"],
};
const EXCEPTION_RULES = ["important", "color-literal", "z-index"];

/** Load styles.config.json (TDD CSS delivery, Configuration); unknown keys fail. */
export function loadStyleConfig(file = path.join(packageDir, "styles.config.json")) {
  const config = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = [];
  const known = (object, keys, where) => {
    for (const key of Object.keys(object ?? {})) if (!keys.includes(key)) errors.push(`${where}: unknown key "${key}"`);
  };
  known(config, CONFIG_KEYS.root, "config");
  if (config.schemaVersion !== 1) errors.push("config: schemaVersion must be 1");
  known(config.aggregate, CONFIG_KEYS.aggregate, "aggregate");
  for (const [name, record] of Object.entries(config.runtimeProperties ?? {})) {
    known(record, CONFIG_KEYS.runtimeProperty, `runtimeProperties.${name}`);
    if (!/^--(?!ds-)[a-z][a-z0-9-]*$/.test(name)) errors.push(`runtimeProperties.${name}: not a non-token custom property name`);
    if (!record.owner || !record.purpose) errors.push(`runtimeProperties.${name}: owner and purpose are required`);
  }
  (config.exceptions ?? []).forEach((exception, index) => {
    const where = `exceptions[${index}]`;
    known(exception, CONFIG_KEYS.exception, where);
    if (!EXCEPTION_RULES.includes(exception.rule)) errors.push(`${where}: rule must be one of ${EXCEPTION_RULES.join(", ")}`);
    for (const key of ["selector", "standard", "reason", "removal"]) if (!exception[key]) errors.push(`${where}: ${key} is required`);
    if (!exception.properties?.length) errors.push(`${where}: properties are required`);
  });
  if (errors.length > 0) throw new Error(`Invalid style configuration:\n${errors.join("\n")}`);
  return config;
}

const STYLE_CONFIG = loadStyleConfig();

/** The composition root of scoped resets and base rules (src/styles/abstracts/_scope.scss). */
export const THEME_ROOT = STYLE_CONFIG.themeRoot;

/** Frozen Panda recipe inventory (ADR-GLB-FE-013 5.3.2): no new recipe ownership. */
export const RECIPES = STYLE_CONFIG.recipes;

/**
 * Custom properties set or derived at runtime (STD-GLB-FE-005 3.2: inline
 * style carries only runtime-computed values). Each records its owner.
 */
export const RUNTIME_PROPERTIES = STYLE_CONFIG.runtimeProperties;

// Color functions and named colors that hardcode a color (STD-GLB-FE-005 3.2).
// Keywords such as transparent, currentcolor, and CSS system colors are not literals.
const COLOR_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"]);
const NAMED_COLORS = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));

const TOKEN_ROOT = /^\[data-scnx-theme="[a-z0-9]+(?:-[a-z0-9]+)*"\]\[data-scnx-resolved-mode="(?:light|dark)"\]$/;
const RECIPE_CLASS = new RegExp(`^\\.(?:${RECIPES.join("|")})(?:--[\\w-]+)?(?=$|[\\s.:[>+~])`);

function selectorFinding(layer, selector) {
  if (layer === "reset" || layer === "base") {
    return selector.startsWith(THEME_ROOT) ? null : `selector "${selector}" in ${layer} is not below ${THEME_ROOT}`;
  }
  if (layer === "tokens") {
    return TOKEN_ROOT.test(selector) ? null : `selector "${selector}" in tokens is not a theme/mode root`;
  }
  if (layer === "components") {
    return /^\.scnx-[\w-]+/.test(selector) ? null : `selector "${selector}" in components does not start at a .scnx- component root`;
  }
  if (layer === "recipes") {
    return RECIPE_CLASS.test(selector) ? null : `selector "${selector}" in recipes is not a frozen Panda recipe class`;
  }
  return `UI Platform emits no rules in the ${layer} layer ("${selector}")`;
}

/**
 * Check one stylesheet.
 * @param {string} css
 * @param {{ tokenNames: Set<string> }} options emitted --ds-* names
 * @returns {{ findings: string[], stats: { rules: Record<string, number>, declarations: number } }}
 */
export function checkStylesheet(css, { tokenNames, config = STYLE_CONFIG }) {
  const findings = [];
  const usedExceptions = new Set();
  const excepted = (rule, selector, property) => {
    const index = (config.exceptions ?? []).findIndex(
      (e) => e.rule === rule && e.selector === selector && e.properties.includes(property),
    );
    if (index > -1) usedExceptions.add(index);
    return index > -1;
  };
  const runtime = config.runtimeProperties ?? {};
  const rules = Object.fromEntries(LAYERS.map((layer) => [layer, 0]));
  let declarations = 0;
  const declared = new Set();
  const referenced = new Map();
  const owners = { components: new Set(), recipes: new Set() };

  let ast;
  try {
    ast = csstree.parse(css, { parseValue: true, onParseError: (error) => findings.push(`parse error: ${error.message}`) });
  } catch (error) {
    return { findings: [`parse error: ${error.message}`], stats: { rules, declarations } };
  }

  const top = ast.children.toArray();
  const first = top[0];
  if (!first || first.type !== "Atrule" || first.name !== "layer" || first.block || `@layer ${csstree.generate(first.prelude)};` !== LAYER_STATEMENT.replaceAll(", ", ",")) {
    findings.push(`stylesheet does not open with "${LAYER_STATEMENT}"`);
  }

  const visitRule = (rule, layer) => {
    const selectors = rule.prelude.type === "SelectorList" ? rule.prelude.children.toArray().map((s) => csstree.generate(s)) : [csstree.generate(rule.prelude)];
    if (!layer) {
      findings.push(`rule "${selectors.join(", ")}" is outside every layer`);
    } else {
      rules[layer]++;
      for (const selector of selectors) {
        const finding = selectorFinding(layer, selector);
        if (finding) findings.push(finding);
      }
    }
    for (const node of rule.block.children.toArray()) {
      if (node.type === "Rule") {
        visitRule(node, layer);
        continue;
      }
      if (node.type !== "Declaration") continue;
      declarations++;
      const property = node.property;
      const value = csstree.generate(node.value);
      if (property.startsWith("--")) {
        declared.add(property);
        if (layer === "tokens" ? !property.startsWith("--ds-") : !runtime[property]) {
          findings.push(`${selectors[0]}: ad-hoc custom property ${property}; use a --ds-* token, a Tier-3 alias, or a documented runtime property`);
        }
      }
      if (layer && layer !== "tokens") {
        for (const selector of selectors) {
          if (node.important && !excepted("important", selector, property)) {
            findings.push(`${selector}: !important on ${property} has no recorded exception`);
          }
          if (property === "z-index" && !/^(?:auto|var\(--ds-[\w-]*z-index[\w-]*\))$/.test(value) && !excepted("z-index", selector, property)) {
            findings.push(`${selector}: z-index ${value} is not a z-index token`);
          }
        }
        let literal = null;
        csstree.walk(node.value, {
          enter(child) {
            if (literal) return;
            if (child.type === "Function" && child.name === "var") return this.skip;
            if (child.type === "Hash") literal = `#${child.value}`;
            else if (child.type === "Function" && COLOR_FUNCTIONS.has(child.name.toLowerCase())) literal = `${child.name}()`;
            else if (child.type === "Identifier" && NAMED_COLORS.has(child.name.toLowerCase())) literal = child.name;
          },
        });
        if (literal && !property.startsWith("--")) {
          for (const selector of selectors) {
            if (!excepted("color-literal", selector, property)) findings.push(`${selector}: color literal ${literal} in ${property}`);
          }
        }
      }
      if (layer === "components" || layer === "recipes") {
        for (const selector of selectors) owners[layer].add(`${selector} { ${node.property} }`);
      }
      csstree.walk(node.value, (value) => {
        if (value.type !== "Function" || value.name !== "var") return;
        const name = value.children.first?.name;
        if (name && !referenced.has(name)) referenced.set(name, selectors[0]);
      });
    }
  };

  const visit = (nodes, layer, depth) => {
    for (const node of nodes) {
      if (node.type === "Rule") {
        visitRule(node, layer);
      } else if (node.type === "Atrule") {
        if (node.name === "layer") {
          if (!node.block) {
            if (!(depth === 0 && node === first)) findings.push("a layer order statement appears after the first rule");
            continue;
          }
          const name = csstree.generate(node.prelude);
          if (layer) findings.push(`layer "${name}" is nested inside "${layer}"`);
          else if (!LAYERS.includes(name)) findings.push(`layer "${name}" is not a canonical layer`);
          visit(node.block.children.toArray(), layer ?? name, depth + 1);
        } else if (["media", "supports", "container"].includes(node.name)) {
          visit(node.block?.children.toArray() ?? [], layer, depth + 1);
        } else if (node.name === "font-face" && depth === 0) {
          continue;
        } else {
          findings.push(`at-rule @${node.name} is not allowed${depth === 0 ? " at the top level" : ""}`);
        }
      }
    }
  };
  visit(top, null, 0);

  for (const [name, selector] of referenced) {
    if (tokenNames.has(name) || declared.has(name) || runtime[name]) continue;
    findings.push(`var(${name}) in "${selector}" is undefined: not an emitted token, a declared property, or a documented runtime property`);
  }
  for (const pair of owners.components) {
    if (owners.recipes.has(pair)) findings.push(`"${pair}" is owned by both components and recipes`);
  }
  return { findings, stats: { rules, declarations }, usedExceptions };
}

const STATEMENT = LAYER_STATEMENT;
const SELF_TESTS = [
  ["valid", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-x, transparent); z-index: var(--ds-dimension-z-index-modal); transition-delay: calc(var(--item-index) * 1ms); } }\n@layer base { ${THEME_ROOT} :focus-visible { outline: 0 } }\n@media (forced-colors: active) { @layer base { ${THEME_ROOT} :focus-visible { outline-color: Highlight } } }`, null],
  ["no order statement", "@layer components { .scnx-a { color: red } }", "does not open with"],
  ["unlayered rule", `${STATEMENT}\n.scnx-a { color: red }`, "outside every layer"],
  ["undeclared layer", `${STATEMENT}\n@layer theme { .scnx-a { color: red } }`, "not a canonical layer"],
  ["nested layer", `${STATEMENT}\n@layer recipes { @layer _base { .flex { display: flex } } }`, "nested inside"],
  ["global reset", `${STATEMENT}\n@layer reset { * { box-sizing: border-box } }`, "is not below"],
  ["host body rule", `${STATEMENT}\n@layer base { body { margin: 0 } }`, "is not below"],
  ["root token block", `${STATEMENT}\n@layer tokens { :root { --ds-x: red } }`, "not a theme/mode root"],
  ["unprefixed component", `${STATEMENT}\n@layer components { .card { color: red } }`, "does not start at a .scnx-"],
  ["new recipe", `${STATEMENT}\n@layer recipes { .badge { color: red } }`, "not a frozen Panda recipe"],
  ["utility rule", `${STATEMENT}\n@layer utilities { .d_flex { display: flex } }`, "emits no rules in the utilities"],
  ["undefined variable", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-missing) } }`, "var(--ds-missing)"],
  ["duplicate owner", `${STATEMENT}\n@layer components { .flex { gap: 0 } }\n@layer recipes { .flex { gap: 1px } }`, "owned by both"],
  ["import", `${STATEMENT}\n@import "x.css";`, "@import is not allowed"],
  ["integer z-index", `${STATEMENT}\n@layer components { .scnx-a { z-index: 10 } }`, "is not a z-index token"],
  ["important", `${STATEMENT}\n@layer components { .scnx-a { padding: 0 !important } }`, "has no recorded exception"],
  ["ad-hoc property", `${STATEMENT}\n@layer components { .scnx-a { --card-bg: var(--ds-x) } }`, "ad-hoc custom property --card-bg"],
  ["hex color", `${STATEMENT}\n@layer components { .scnx-a { color: #fff } }`, "color literal #fff"],
  ["rgb color", `${STATEMENT}\n@layer components { .scnx-a { border: 1px solid rgb(0 0 0) } }`, "color literal rgb()"],
  ["named color", `${STATEMENT}\n@layer base { ${THEME_ROOT} a { color: red } }`, "color literal red"],
];

function selfTest() {
  const tokenNames = new Set(["--ds-x", "--ds-dimension-z-index-modal"]);
  const failures = [];
  for (const [label, css, expected] of SELF_TESTS) {
    const { findings } = checkStylesheet(css, { tokenNames });
    if (expected === null && findings.length > 0) failures.push(`${label}: expected no findings, got ${findings.join("; ")}`);
    if (expected !== null && !findings.some((f) => f.includes(expected))) failures.push(`${label}: expected "${expected}", got ${findings.join("; ") || "nothing"}`);
  }
  if (failures.length > 0) throw new Error(`Stylesheet gate self-test failed:\n${failures.join("\n")}`);
  console.log(`Stylesheet gate self-test passed: ${SELF_TESTS.length} cases`);
}

/** Check every published stylesheet under `dist`; returns a report or throws. */
export function checkDist(distDir) {
  const tokenNames = new Set();
  const jsonDir = path.join(distDir, "tokens/json");
  for (const file of fs.readdirSync(jsonDir)) {
    for (const token of JSON.parse(fs.readFileSync(path.join(jsonDir, file), "utf8")).tokens) tokenNames.add(token.cssName);
  }
  const sheets = ["styles/components.css", ...fs.readdirSync(path.join(distDir, "tokens/css")).map((f) => `tokens/css/${f}`)];
  const report = {};
  const failures = [];
  const used = new Set();
  for (const sheet of sheets) {
    const { findings, stats, usedExceptions } = checkStylesheet(fs.readFileSync(path.join(distDir, sheet), "utf8"), { tokenNames });
    for (const index of usedExceptions) used.add(index);
    report[sheet] = { ...stats, findings: findings.length };
    failures.push(...findings.map((f) => `${sheet}: ${f}`));
  }
  STYLE_CONFIG.exceptions.forEach((exception, index) => {
    if (!used.has(index)) failures.push(`styles.config.json exceptions[${index}] (${exception.rule} ${exception.selector}) matches no rule; remove it`);
  });
  if (failures.length > 0) throw new Error(`Stylesheet gate failed:\n${failures.join("\n")}`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes("--self-test")) {
      selfTest();
    } else {
      const index = process.argv.indexOf("--dist");
      const report = checkDist(path.resolve(index > -1 ? process.argv[index + 1] : "dist"));
      for (const [sheet, { rules, declarations }] of Object.entries(report)) {
        const layers = Object.entries(rules).filter(([, n]) => n > 0).map(([l, n]) => `${l}:${n}`).join(" ");
        console.log(`${sheet.padEnd(28)} ${String(declarations).padStart(5)} declarations  ${layers}`);
      }
      console.log("Stylesheet gate passed");
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
