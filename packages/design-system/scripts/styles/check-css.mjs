#!/usr/bin/env node
// Static stylesheet gate (TDD CSS delivery, "Compile and assemble" step 4;
// STD-GLB-FE-005 sections 3.3-3.4; STD-UIP-STY-001 cascade contract). Rejects:
// - a stylesheet that does not open with the canonical layer order;
// - any style rule outside a canonical layer, a nested or undeclared layer;
// - selectors outside the allowed scope of their layer;
// - var() references to custom properties that are neither emitted tokens,
//   declared in the same stylesheet, nor documented runtime properties;
// - a selector/property pair owned by both Sass components and Panda recipes.
//
//   node scripts/styles/check-css.mjs --dist <dir>   check the built assets
//   node scripts/styles/check-css.mjs --self-test    prove each rule rejects

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as csstree from "css-tree";
import { LAYERS, LAYER_STATEMENT } from "./layers.mjs";

/** The composition root of scoped resets and base rules (src/styles/abstracts/_scope.scss). */
export const THEME_ROOT = ":where([data-scnx-theme][data-scnx-resolved-mode])";

/** Frozen Panda recipe inventory (ADR-GLB-FE-013 5.3.2): no new recipe ownership. */
export const RECIPES = ["container", "flex", "grid", "heading", "code", "text", "list", "list-item"];

/**
 * Custom properties a component sets inline at runtime (STD-GLB-FE-005 3.2:
 * inline style carries only runtime-computed values). Each records its owner.
 */
export const RUNTIME_PROPERTIES = {
  "--item-index": "position of a navigation item, set inline by the sidebar navigation for staggered entry",
};

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
export function checkStylesheet(css, { tokenNames }) {
  const findings = [];
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
      if (node.property.startsWith("--")) declared.add(node.property);
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
    if (tokenNames.has(name) || declared.has(name) || RUNTIME_PROPERTIES[name]) continue;
    findings.push(`var(${name}) in "${selector}" is undefined: not an emitted token, a declared property, or a documented runtime property`);
  }
  for (const pair of owners.components) {
    if (owners.recipes.has(pair)) findings.push(`"${pair}" is owned by both components and recipes`);
  }
  return { findings, stats: { rules, declarations } };
}

const STATEMENT = LAYER_STATEMENT;
const SELF_TESTS = [
  ["valid", `${STATEMENT}\n@layer components { .scnx-a { color: var(--ds-x); --scnx-local: 1px; width: var(--scnx-local); } }\n@layer base { ${THEME_ROOT} :focus-visible { outline: 0 } }`, null],
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
];

function selfTest() {
  const tokenNames = new Set(["--ds-x"]);
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
  for (const sheet of sheets) {
    const { findings, stats } = checkStylesheet(fs.readFileSync(path.join(distDir, sheet), "utf8"), { tokenNames });
    report[sheet] = { ...stats, findings: findings.length };
    failures.push(...findings.map((f) => `${sheet}: ${f}`));
  }
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
