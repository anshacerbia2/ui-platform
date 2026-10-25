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
//   literals, motion literals (a duration or timing function in a transition
//   or animation property), a non-zero length in a border radius, a non-zero
//   length in a spacing or positioning property, a non-zero length or number
//   in font-size, line-height, letter-spacing, or font-weight, ad-hoc
//   custom properties, and !important, unless styles.config.json records the
//   exception. A duration inside a calc() that multiplies a documented runtime
//   property (a stagger step) is a local value whose purpose that property
//   records (STD-GLB-FE-005 3.2). An exception no rule uses fails.
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
  root: ["schemaVersion", "aggregate", "themeRoot", "recipes", "runtimeProperties", "hookedComponents", "exceptions"],
  aggregate: ["source", "publish"],
  runtimeProperty: ["owner", "purpose"],
  exception: ["rule", "selector", "properties", "standard", "reason", "removal"],
};
const EXCEPTION_RULES = ["important", "color-literal", "z-index", "motion-literal", "radius-literal", "spacing-literal", "typography-literal", "design-literal"];

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
  for (const name of config.hookedComponents ?? []) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) errors.push(`hookedComponents: "${name}" is not a component name`);
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
const MOTION_PROPERTY = /^(?:transition|animation)(?:-(?:duration|delay|timing-function))?$/;
const TIMING_KEYWORDS = new Set(["ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start", "step-end"]);
const SPACING_PROPERTY = /^(?:(?:padding|margin|inset|scroll-padding|scroll-margin)(?:-[a-z-]+)?|gap|row-gap|column-gap|top|right|bottom|left)$/;
const TYPOGRAPHY_PROPERTY = /^(?:font-size|line-height|letter-spacing|font-weight)$/;

/** First non-zero length or number outside var(); percentages and keywords are geometry. */
function lengthLiteral(value, { numbers = false } = {}) {
  let found = null;
  csstree.walk(value, {
    enter(node) {
      if (found) return;
      if (node.type === "Function" && node.name === "var") return this.skip;
      if (node.type === "Dimension" && Number(node.value) !== 0) found = `${node.value}${node.unit}`;
      else if (numbers && node.type === "Number" && Number(node.value) !== 0) found = node.value;
    },
  });
  return found;
}

const RADIUS_PROPERTY = /^border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius$/;

/** First motion literal in a transition/animation value, skipping var() and stagger steps. */
function motionLiteral(value, runtime) {
  let found = null;
  csstree.walk(value, {
    enter(node) {
      if (found) return;
      if (node.type === "Function" && node.name === "var") return this.skip;
      if (node.type === "Function" && node.name === "calc") {
        let stagger = false;
        csstree.walk(node, (inner) => {
          if (inner.type === "Function" && inner.name === "var" && runtime[inner.children.first?.name]) stagger = true;
        });
        if (stagger) return this.skip;
      }
      if (node.type === "Dimension" && /^m?s$/i.test(node.unit) && Number(node.value) !== 0) found = `${node.value}${node.unit}`;
      else if (node.type === "Function" && ["cubic-bezier", "steps", "linear"].includes(node.name)) found = `${node.name}()`;
      else if (node.type === "Identifier" && TIMING_KEYWORDS.has(node.name)) found = node.name;
    },
  });
  return found;
}

/** First non-zero length in a border radius outside var(); percentages are geometry. */
function radiusLiteral(value) {
  let found = null;
  csstree.walk(value, {
    enter(node) {
      if (found) return;
      if (node.type === "Function" && node.name === "var") return this.skip;
      if (node.type === "Dimension" && Number(node.value) !== 0) found = `${node.value}${node.unit}`;
    },
  });
  return found;
}

const COLOR_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"]);
const NAMED_COLORS = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));

/**
 * Presentational properties (ADR-UIP-VIS-001 item 8): in a hooked component
 * every one reads a Tier-3 hook that falls back to Tier 2. Layout, state
 * mechanics, and anatomy (display, position, cursor, aspect-ratio, content)
 * are not design values.
 */
const PRESENTATIONAL_PROPERTY = /^(?:color|background(?:-color)?|border(?:-[a-z-]+)?|outline(?:-(?:color|width|offset))?|box-shadow|(?:padding|margin|inset)(?:-[a-z-]+)?|gap|row-gap|column-gap|top|right|bottom|left|(?:min-|max-)?(?:width|height|inline-size|block-size)|font(?:-[a-z-]+)?|line-height|letter-spacing|(?:transition|animation)(?:-(?:duration|delay|timing-function))?|opacity|translate|fill|stroke|text-decoration-color|accent-color|caret-color)$/;

/** The component a component-layer selector belongs to: `.scnx-icon-button[...]` is `icon-button`. */
const componentOf = (selector) => /^\.scnx-([a-z0-9]+(?:-[a-z0-9]+)*?)(?=__|--|[^a-z0-9-]|$)/.exec(selector)?.[1] ?? null;

/** A var() node: its custom property name and its fallback text, if any. */
function varParts(node) {
  const children = node.children.toArray();
  const name = children[0]?.type === "Identifier" ? children[0].name : null;
  const comma = children.findIndex((c) => c.type === "Operator" && c.value === ",");
  const fallback = comma > -1 ? children.slice(comma + 1).map((c) => csstree.generate(c)).join("").trim() : null;
  return { name, fallback };
}

/**
 * Design literals and Tier-2 tokens outside the hook pattern (STD-UIP-TKN-001
 * 2.7.0, "Hook mechanics"): a token must be a hook's fallback, and a literal
 * (a non-zero length or number, a colour) may stand only in a hook's
 * fallback or beside a hook inside a function, as a floor does in
 * `max(24px, var(--scnx-…))`. Keywords, zero, and percentages are not design
 * values.
 */
export function designLiterals(value) {
  const found = [];
  const hasHook = (node) => {
    let hook = false;
    csstree.walk(node, (n) => {
      if (n.type === "Function" && n.name === "var" && varParts(n).name?.startsWith("--scnx-")) hook = true;
    });
    return hook;
  };
  const visit = (node, beside) => {
    if (node.type === "Function" && node.name === "var") {
      const { name } = varParts(node);
      if (name?.startsWith("--scnx-")) return;
      if (name?.startsWith("--ds-")) found.push(`token ${name} outside a hook`);
      return;
    }
    if (node.type === "Dimension" && Number(node.value) !== 0 && !beside) found.push(`${node.value}${node.unit}`);
    else if (node.type === "Number" && Number(node.value) !== 0 && !beside) found.push(node.value);
    else if (node.type === "Hash") found.push(`#${node.value}`);
    else if (node.type === "Function" && COLOR_FUNCTIONS.has(node.name.toLowerCase())) found.push(`${node.name}()`);
    else if (node.type === "Identifier" && NAMED_COLORS.has(node.name.toLowerCase())) found.push(node.name);
    const inner = node.type === "Function" && hasHook(node);
    node.children?.forEach?.((child) => visit(child, beside || inner));
  };
  visit(value, false);
  return found;
}

/** Every custom property a value references, fallbacks included (css-tree keeps a fallback as raw text). */
function referencedNames(value, into) {
  csstree.walk(value, (node) => {
    if (node.type !== "Function" || node.name !== "var") return;
    const { name, fallback } = varParts(node);
    if (name) into.push(name);
    if (fallback) referencedNames(csstree.parse(fallback, { context: "value" }), into);
  });
  return into;
}

const TOKEN_ROOT = /^\[data-scnx-theme="[a-z0-9]+(?:-[a-z0-9]+)*"\]\[data-scnx-resolved-mode="(?:light|dark)"\]$/;
// Recipe classes share the .scnx- namespace, so they cannot match host class names (TDD styled RN1).
const RECIPE_CLASS = new RegExp(`^\\.scnx-(?:${RECIPES.join("|")})(?:--[\\w-]+)?(?=$|[\\s.:[>+~])`);

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
        if (property.startsWith("--scnx-")) {
          findings.push(`${selectors[0]}: declares the hook ${property}; a hook is referenced with a fallback, never declared (STD-UIP-TKN-001 2.7.0)`);
        } else if (layer === "tokens" ? !property.startsWith("--ds-") : !runtime[property]) {
          findings.push(`${selectors[0]}: ad-hoc custom property ${property}; use a --ds-* token, a --scnx-* hook, or a documented runtime property`);
        }
      }
      // Hooks: referenced with a fallback, and in the namespace of the component the rule styles.
      csstree.walk(node.value, (child) => {
        if (child.type !== "Function" || child.name !== "var") return;
        const { name, fallback } = varParts(child);
        if (!name?.startsWith("--scnx-")) return;
        if (!fallback) findings.push(`${selectors[0]}: var(${name}) has no fallback; a hook falls back to a Tier-2 token`);
        for (const selector of selectors) {
          const component = componentOf(selector);
          if (layer !== "components" || !component || !name.startsWith(`--scnx-${component}-`)) {
            findings.push(`${selector}: hook ${name} is not in the namespace of the component this rule styles`);
          }
        }
      });
      if (layer === "components" && PRESENTATIONAL_PROPERTY.test(property)) {
        for (const selector of selectors) {
          if (!(config.hookedComponents ?? []).includes(componentOf(selector))) continue;
          for (const literal of designLiterals(node.value)) {
            if (!excepted("design-literal", selector, property)) findings.push(`${selector}: ${property} holds ${literal}; read a --scnx-* hook that falls back to a Tier-2 token`);
          }
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
        if (MOTION_PROPERTY.test(property)) {
          const motion = motionLiteral(node.value, runtime);
          if (motion) {
            for (const selector of selectors) {
              if (!excepted("motion-literal", selector, property)) findings.push(`${selector}: motion literal ${motion} in ${property}; use a --ds-motion-* token`);
            }
          }
        }
        const governed = SPACING_PROPERTY.test(property)
          ? ["spacing-literal", lengthLiteral(node.value), "a --ds-dimension-spacing-* token"]
          : TYPOGRAPHY_PROPERTY.test(property)
            ? ["typography-literal", lengthLiteral(node.value, { numbers: true }), "a --ds-typography-* token"]
            : null;
        if (governed?.[1]) {
          for (const selector of selectors) {
            if (!excepted(governed[0], selector, property)) findings.push(`${selector}: ${governed[0].replace("-", " ")} ${governed[1]} in ${property}; use ${governed[2]} or record a local value`);
          }
        }
        if (RADIUS_PROPERTY.test(property)) {
          const radius = radiusLiteral(node.value);
          if (radius) {
            for (const selector of selectors) {
              if (!excepted("radius-literal", selector, property)) findings.push(`${selector}: radius literal ${radius} in ${property}; use a --ds-dimension-radius-* token`);
            }
          }
        }
        if (literal && !property.startsWith("--")) {
          for (const selector of selectors) {
            if (!excepted("color-literal", selector, property)) findings.push(`${selector}: color literal ${literal} in ${property}`);
          }
        }
      }
      if (layer === "components" || layer === "recipes") {
        for (const selector of selectors) owners[layer].add(`${selector} { ${node.property} }`);
      }
      for (const name of referencedNames(node.value, [])) {
        if (!name.startsWith("--scnx-") && !referenced.has(name)) referenced.set(name, selectors[0]);
      }
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
  ["valid", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-x, transparent); z-index: var(--ds-dimension-z-index-modal); transition-delay: calc(var(--item-index) * 1ms); transition: height var(--ds-x) var(--ds-x), opacity 0s; border-radius: 50% 0; padding: 0 var(--ds-x); top: 100%; gap: 0; line-height: inherit; } }\n@layer base { ${THEME_ROOT} :focus-visible { outline: 0 } }\n@media (forced-colors: active) { @layer base { ${THEME_ROOT} :focus-visible { outline-color: Highlight } } }`, null],
  ["no order statement", "@layer components { .scnx-a { color: red } }", "does not open with"],
  ["unlayered rule", `${STATEMENT}\n.scnx-a { color: red }`, "outside every layer"],
  ["undeclared layer", `${STATEMENT}\n@layer theme { .scnx-a { color: red } }`, "not a canonical layer"],
  ["nested layer", `${STATEMENT}\n@layer recipes { @layer _base { .scnx-flex { display: flex } } }`, "nested inside"],
  ["global reset", `${STATEMENT}\n@layer reset { * { box-sizing: border-box } }`, "is not below"],
  ["host body rule", `${STATEMENT}\n@layer base { body { margin: 0 } }`, "is not below"],
  ["root token block", `${STATEMENT}\n@layer tokens { :root { --ds-x: red } }`, "not a theme/mode root"],
  ["unprefixed component", `${STATEMENT}\n@layer components { .card { color: red } }`, "does not start at a .scnx-"],
  ["new recipe", `${STATEMENT}\n@layer recipes { .badge { color: red } }`, "not a frozen Panda recipe"],
  ["utility rule", `${STATEMENT}\n@layer utilities { .d_flex { display: flex } }`, "emits no rules in the utilities"],
  ["undefined variable", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-missing) } }`, "var(--ds-missing)"],
  ["duplicate owner", `${STATEMENT}\n@layer components { .scnx-flex { gap: 0 } }\n@layer recipes { .scnx-flex { gap: 1px } }`, "owned by both"],
  ["import", `${STATEMENT}\n@import "x.css";`, "@import is not allowed"],
  ["integer z-index", `${STATEMENT}\n@layer components { .scnx-a { z-index: 10 } }`, "is not a z-index token"],
  ["important", `${STATEMENT}\n@layer components { .scnx-a { padding: 0 !important } }`, "has no recorded exception"],
  ["ad-hoc property", `${STATEMENT}\n@layer components { .scnx-a { --card-bg: var(--ds-x) } }`, "ad-hoc custom property --card-bg"],
  ["hex color", `${STATEMENT}\n@layer components { .scnx-a { color: #fff } }`, "color literal #fff"],
  ["rgb color", `${STATEMENT}\n@layer components { .scnx-a { border: 1px solid rgb(0 0 0) } }`, "color literal rgb()"],
  ["named color", `${STATEMENT}\n@layer base { ${THEME_ROOT} a { color: red } }`, "color literal red"],
  ["motion duration", `${STATEMENT}\n@layer components { .scnx-a { transition: height 0.3s var(--ds-x) } }`, "motion literal 0.3s"],
  ["motion easing", `${STATEMENT}\n@layer components { .scnx-a { transition: color var(--ds-x) ease } }`, "motion literal ease"],
  ["motion curve", `${STATEMENT}\n@layer components { .scnx-a { animation-timing-function: cubic-bezier(0, 0, 1, 1) } }`, "motion literal cubic-bezier()"],
  ["delay without runtime property", `${STATEMENT}\n@layer components { .scnx-a { transition-delay: calc(2 * 33ms) } }`, "motion literal 33ms"],
  ["radius length", `${STATEMENT}\n@layer components { .scnx-a { border-radius: 3px } }`, "radius literal 3px"],
  ["spacing length", `${STATEMENT}\n@layer components { .scnx-a { padding: var(--ds-x) 1.25rem } }`, "spacing literal 1.25rem"],
  ["spacing offset", `${STATEMENT}\n@layer components { .scnx-a { top: 4rem } }`, "spacing literal 4rem"],
  ["font size", `${STATEMENT}\n@layer components { .scnx-a { font-size: 0.9em } }`, "typography literal 0.9em"],
  ["unitless line height", `${STATEMENT}\n@layer components { .scnx-a { line-height: 1 } }`, "typography literal 1"],
  // Hooks (STD-UIP-TKN-001 2.7.0, "Hook mechanics"); the last entry marks `.scnx-a` as hooked.
  ["hooked component", `${STATEMENT}\n@layer components { .scnx-a { border-radius: var(--scnx-a-radius, var(--ds-x)); block-size: max(24px, var(--scnx-a-height, var(--ds-x))); margin-bottom: calc(-1 * var(--scnx-a-border-width, var(--ds-x))); background: var(--scnx-a-background, transparent); padding: 0; inline-size: 100%; display: flex } }`, null, true],
  ["hook without fallback", `${STATEMENT}\n@layer components { .scnx-a { color: var(--scnx-a-color) } }`, "has no fallback"],
  ["declared hook", `${STATEMENT}\n@layer components { .scnx-a { --scnx-a-color: var(--ds-x) } }`, "never declared"],
  ["foreign hook", `${STATEMENT}\n@layer components { .scnx-a { color: var(--scnx-b-color, var(--ds-x)) } }`, "not in the namespace"],
  ["hook fallback to a missing token", `${STATEMENT}\n@layer components { .scnx-a { color: var(--scnx-a-color, var(--ds-missing)) } }`, "var(--ds-missing)"],
  ["token outside a hook", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-x) } }`, "token --ds-x outside a hook", true],
  ["literal outside a hook", `${STATEMENT}\n@layer components { .scnx-a { inline-size: 32rem } }`, "inline-size holds 32rem", true],
];

function selfTest() {
  const tokenNames = new Set(["--ds-x", "--ds-dimension-z-index-modal"]);
  const failures = [];
  for (const [label, css, expected, hooked = false] of SELF_TESTS) {
    const config = hooked ? { ...STYLE_CONFIG, hookedComponents: ["a"] } : STYLE_CONFIG;
    const { findings } = checkStylesheet(css, { tokenNames, config });
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
