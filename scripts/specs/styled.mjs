// Styled specification rules (ADR-UIP-CMP-001 items 3, 4, 6; TDD styled CS2-CS5).
// Static checks compare a styled specification with the published stylesheet
// and the public-API report; `cases` derives the contrast pairs it renders.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const csstree = createRequire(path.join(root, "packages/design-system/package.json"))("css-tree");

/** `{color.primary.surface.solid.default}` -> `var(--ds-color-primary-surface-solid-default)`. */
export const toCss = (template) => template.replace(/\{([a-z0-9.-]+)\}/g, (_, token) => `var(--ds-${token.replaceAll(".", "-")})`);
/** Token paths named in a template. */
export const tokensIn = (template) => [...template.matchAll(/\{([a-z0-9.-]+)\}/g)].map((m) => m[1]);
const normalizeValue = (value) => csstree.generate(csstree.parse(value, { context: "value" }));
const normalizeSelector = (selector) => csstree.generate(csstree.parse(selector, { context: "selector" }));

/** Identity of a binding: part, option values, state. */
export const bindingKey = ({ part, option = {}, state = "" }) =>
  `${part}|${Object.entries(option).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(",")}|${state}`;

/**
 * The fragments that may follow a part selector: one per option value and
 * one per state selector, normalized as the stylesheet serializes them.
 */
function fragments(spec, partSelector) {
  const strip = (fragment) => normalizeSelector(`${partSelector}${fragment}`).slice(partSelector.length);
  const out = [];
  for (const [option, { values, selector }] of Object.entries(spec.options)) {
    for (const value of values) out.push({ kind: "option", option, value, text: strip(selector.replace("{value}", value)) });
  }
  for (const state of spec.states) {
    state.selectors.forEach((selector, index) => out.push({ kind: "state", state: state.name, index, text: strip(selector) }));
  }
  return out.sort((a, b) => b.text.length - a.text.length);
}

/** Map one serialized selector to a binding identity, or null when the specification does not describe it. */
function describe(selector, spec, parts) {
  for (const part of parts) {
    if (!selector.startsWith(part.selector)) continue;
    let rest = selector.slice(part.selector.length);
    if (/^[a-z0-9_-]/i.test(rest)) continue;
    const option = {};
    let state = "";
    let alternative = -1;
    const known = fragments(spec, part.selector);
    while (rest.length > 0) {
      const hit = known.find((f) => rest.startsWith(f.text));
      if (!hit) return null;
      if (hit.kind === "option") option[hit.option] = hit.value;
      else if (state) return null;
      else [state, alternative] = [hit.state, hit.index];
      rest = rest.slice(hit.text.length);
    }
    return { part: part.name, option, state, alternative };
  }
  return undefined;
}

/**
 * Token-bearing declarations of the component, keyed by binding identity,
 * from the published aggregate stylesheet. Later declarations of a property
 * in one rule win, as in the cascade.
 */
export function stylesheetBindings(css, spec) {
  const parts = [...spec.anatomy].sort((a, b) => b.selector.length - a.selector.length);
  const found = new Map();
  const findings = [];
  const alternatives = new Map();
  csstree.walk(csstree.parse(css), {
    visit: "Rule",
    enter(rule) {
      const selectors = rule.prelude.children.toArray().map((s) => csstree.generate(s));
      const described = selectors.map((s) => [s, describe(s, spec, parts)]).filter(([, d]) => d !== undefined);
      if (described.length === 0) return;
      const declarations = {};
      rule.block.children.forEach((node) => {
        if (node.type !== "Declaration") return;
        const value = csstree.generate(node.value);
        if (value.includes("var(--ds-")) declarations[node.property] = value;
        else delete declarations[node.property];
      });
      for (const [selector, d] of described) {
        if (d === null) {
          findings.push(`stylesheet selector ${selector} is not described by the specification's parts, options, and states`);
          continue;
        }
        if (Object.keys(declarations).length === 0) continue;
        const key = bindingKey(d);
        found.set(key, { ...found.get(key), ...declarations });
        if (d.state) alternatives.set(key, new Set([...(alternatives.get(key) ?? []), d.alternative]));
      }
    },
  });
  for (const [key, seen] of alternatives) {
    const state = spec.states.find((s) => s.name === key.split("|")[2]);
    state.selectors.forEach((selector, index) => {
      if (!seen.has(index)) findings.push(`state ${state.name} (${key}): the stylesheet has no rule for its selector ${selector}`);
    });
  }
  return { found, findings };
}

/** Option unions of the public-API report: `name?: "a" | "b";`. */
export function apiUnion(report, option) {
  const line = new RegExp(`\\b${option}\\??:\\s*([^;]+);`).exec(report)?.[1];
  return line ? [...line.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : null;
}

/**
 * Static findings for one styled specification (CS2, CS3).
 * @param {object} spec
 * @param {{ css: string, report: string, primitive?: object, tokens: Set<string> }} context
 */
export function styledFindings(spec, { css, report, primitive, tokens }) {
  const findings = [];
  const parts = new Set(spec.anatomy.map((p) => p.name));
  const states = new Set(spec.states.map((s) => s.name));
  if (spec.primitive && !primitive) findings.push(`primitive ${spec.primitive} has no primitive specification`);
  for (const part of spec.anatomy) {
    if (part.primitivePart && primitive && !primitive.parts.some((p) => p.name === part.primitivePart)) {
      findings.push(`part ${part.name} styles ${part.primitivePart}, which ${spec.primitive} does not declare`);
    }
  }
  for (const [option, { values, default: fallback }] of Object.entries(spec.options)) {
    if (!values.includes(fallback)) findings.push(`option ${option}: default ${fallback} is not one of its values`);
    const union = apiUnion(report, option);
    if (!union) findings.push(`option ${option}: the public-API report declares no such prop`);
    else if ([...union].sort().join() !== [...values].sort().join()) findings.push(`option ${option}: values ${values.join(" | ")} differ from the published union ${union.join(" | ")}`);
  }
  const declared = new Map();
  for (const binding of spec.bindings) {
    if (!parts.has(binding.part)) findings.push(`binding names undeclared part ${binding.part}`);
    if (binding.state && !states.has(binding.state)) findings.push(`binding names undeclared state ${binding.state}`);
    for (const [option, value] of Object.entries(binding.option ?? {})) {
      if (!spec.options[option]?.values.includes(value)) findings.push(`binding names undeclared option value ${option}=${value}`);
    }
    for (const template of Object.values(binding.declarations)) {
      for (const token of tokensIn(template)) if (!tokens.has(`--ds-${token.replaceAll(".", "-")}`)) findings.push(`binding names token ${token}, which the token stylesheets do not emit`);
    }
    const key = bindingKey(binding);
    if (declared.has(key)) findings.push(`two bindings for ${key}`);
    declared.set(key, Object.fromEntries(Object.entries(binding.declarations).map(([p, v]) => [p, normalizeValue(toCss(v))])));
  }
  // Ambiguity: an option-only and a state-only binding of one part set the same property.
  for (const binding of spec.bindings.filter((b) => b.state && !b.option)) {
    for (const other of spec.bindings.filter((b) => b.option && !b.state && b.part === binding.part)) {
      for (const property of Object.keys(binding.declarations)) {
        if (property in other.declarations) findings.push(`${property} of ${binding.part} is set by both state ${binding.state} and option ${JSON.stringify(other.option)}; bind it on the combination`);
      }
    }
  }
  const { found, findings: sheet } = stylesheetBindings(css, spec);
  findings.push(...sheet);
  for (const key of new Set([...declared.keys(), ...found.keys()])) {
    const want = declared.get(key) ?? {};
    const have = found.get(key) ?? {};
    for (const property of new Set([...Object.keys(want), ...Object.keys(have)])) {
      if (!(property in have)) findings.push(`${key}: binds ${property}, which the stylesheet does not declare with a token`);
      else if (!(property in want)) findings.push(`${key}: the stylesheet declares ${property}: ${have[property]}, which no binding names`);
      else if (want[property] !== have[property]) findings.push(`${key}: ${property} is ${have[property]} in the stylesheet, ${want[property]} in the specification`);
    }
  }
  return findings;
}

/**
 * The declarations in force for a part, option values, and state: the rest
 * binding, then the state-only, the option-only, and the combined bindings.
 */
export function effective(spec, part, option, state) {
  const matches = (b) =>
    b.part === part && (!b.state || b.state === state) && Object.entries(b.option ?? {}).every(([k, v]) => option[k] === v);
  const rank = (b) => (b.option ? 2 : 0) + (b.state ? 1 : 0);
  return spec.bindings
    .filter(matches)
    .sort((a, b) => rank(a) - rank(b))
    .reduce((acc, b) => ({ ...acc, ...b.declarations }), {});
}

/** Every option-value combination of a specification. */
export function combinations(spec) {
  return Object.entries(spec.options).reduce(
    (acc, [option, { values }]) => acc.flatMap((combo) => values.map((value) => ({ ...combo, [option]: value }))),
    [{}],
  );
}

/**
 * CS5: contrast cases a specification renders. A part's `color` on its
 * `background` or `background-color`, per option combination and state,
 * when both are single tokens; disabled states are exempt.
 */
export function contrastPairs(spec) {
  const pairs = [];
  for (const part of spec.anatomy) {
    for (const option of combinations(spec)) {
      for (const state of ["", ...spec.states.map((s) => s.name)]) {
        if (state === "disabled") continue;
        const d = effective(spec, part.name, option, state);
        const bg = d["background-color"] ?? d.background;
        const single = (v) => (v && /^\{[a-z0-9.-]+\}$/.test(v) ? `--ds-${v.slice(1, -1).replaceAll(".", "-")}` : null);
        const [fg, back] = [single(d.color), single(bg)];
        if (fg && back) pairs.push({ fg, bg: back, where: `${spec.entry} ${part.name} ${JSON.stringify(option)} ${state || "rest"}` });
      }
    }
  }
  return pairs;
}

/** Inputs the static rules read, for a styled specification. */
export function styledContext(spec, primitives, tokens) {
  const name = spec.entry.split("/").pop();
  return {
    css: fs.readFileSync(path.join(root, "packages/design-system/dist/styles/components.css"), "utf8"),
    report: fs.readFileSync(path.join(root, `packages/design-system/api/components.${name}.api.md`), "utf8"),
    primitive: primitives.find((p) => p.name === spec.primitive),
    tokens,
  };
}
