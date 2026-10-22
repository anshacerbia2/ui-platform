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
 * The selector grammar of a specification: the root part's class `R`, each
 * part's selector relative to `R` (a combinator and simple selectors, or a
 * pseudo-element), and the fragments options and states add. Options and
 * `on: "root"` states attach to `R`; other states attach to their part. All
 * text is normalized as the stylesheet serializes it.
 */
export function grammar(spec) {
  const R = normalizeSelector(spec.anatomy[0].selector);
  const strip = (fragment) => normalizeSelector(`${R}${fragment}`).slice(R.length);
  const parts = spec.anatomy.map((part, index) => {
    const full = normalizeSelector(part.selector);
    return { name: part.name, rel: full.startsWith(R) ? full.slice(R.length) : null, root: index === 0 };
  });
  const root = [];
  const own = [];
  for (const [option, { values, selector }] of Object.entries(spec.options)) {
    for (const value of values) root.push({ kind: "option", option, value, text: strip(selector.replace("{value}", value)) });
  }
  for (const state of spec.states) {
    state.selectors.forEach((selector, index) => (state.on === "root" ? root : own).push({ kind: "state", state: state.name, index, text: strip(selector) }));
  }
  const longest = (a, b) => b.text.length - a.text.length;
  return { R, parts: parts.sort((a, b) => (b.rel?.length ?? -1) - (a.rel?.length ?? -1)), root: root.sort(longest), own: own.sort(longest) };
}

/** The stylesheet selector of one identity, for locating its element in a rendered fixture. */
export function selectorFor(spec, { part, option = {}, state = "", alternative = 0 }) {
  const g = grammar(spec);
  const rel = g.parts.find((p) => p.name === part).rel;
  const pick = (list) => list.filter((f) => (f.kind === "option" ? option[f.option] === f.value : f.state === state && f.index === alternative)).map((f) => f.text).join("");
  return `${g.R}${pick(g.root)}${rel}${pick(g.own)}`;
}

/** Map one serialized selector to a binding identity, null when the specification does not describe it, undefined when it is another component's. */
function describe(selector, g) {
  if (!selector.startsWith(g.R) || /^[a-z0-9_-]/i.test(selector.slice(g.R.length))) return undefined;
  for (const part of g.parts) {
    if (part.rel === null) continue;
    let rest = selector.slice(g.R.length);
    const option = {};
    let state = "";
    let alternative = -1;
    const consume = (list) => {
      for (let hit = list.find((f) => rest.startsWith(f.text)); hit; hit = list.find((f) => rest.startsWith(f.text))) {
        if (hit.kind === "option") option[hit.option] = hit.value;
        else if (state) return false;
        else [state, alternative] = [hit.state, hit.index];
        rest = rest.slice(hit.text.length);
      }
      return true;
    };
    if (!consume(part.root ? [...g.root, ...g.own] : g.root)) continue;
    if (!rest.startsWith(part.rel)) continue;
    rest = rest.slice(part.rel.length);
    if (!part.root && !consume(g.own)) continue;
    if (rest === "") return { part: part.name, option, state, alternative };
  }
  return null;
}

/**
 * Declarations of the component the bindings must equal, keyed by binding
 * identity, from the published aggregate stylesheet: every token-bearing
 * declaration, and every literal declaration of a property that is bound to a
 * token elsewhere on the same part (an override, for example `border-bottom: 0`
 * in a vertical tab list). Later declarations win, as in the cascade.
 */
export function stylesheetBindings(css, spec) {
  const g = grammar(spec);
  const findings = [];
  const rows = [];
  csstree.walk(csstree.parse(css), {
    visit: "Rule",
    enter(rule) {
      const selectors = rule.prelude.children.toArray().map((s) => csstree.generate(s));
      const described = selectors.map((s) => [s, describe(s, g)]).filter(([, d]) => d !== undefined);
      if (described.length === 0) return;
      const declarations = {};
      rule.block.children.forEach((node) => {
        if (node.type !== "Declaration") return;
        delete declarations[node.property];
        declarations[node.property] = csstree.generate(node.value);
      });
      for (const [selector, d] of described) {
        if (d === null) findings.push(`stylesheet selector ${selector} is not described by the specification's parts, options, and states`);
        else rows.push({ d, declarations });
      }
    },
  });
  const tokenProperties = new Map();
  for (const { d, declarations } of rows) {
    for (const [property, value] of Object.entries(declarations)) {
      if (value.includes("var(--ds-")) tokenProperties.set(d.part, new Set([...(tokenProperties.get(d.part) ?? []), property]));
    }
  }
  const found = new Map();
  const alternatives = new Map();
  const order = new Map();
  for (const [position, { d, declarations }] of rows.entries()) {
    const kept = Object.fromEntries(Object.entries(declarations).filter(([p, v]) => v.includes("var(--ds-") || tokenProperties.get(d.part)?.has(p)));
    if (Object.keys(kept).length === 0) continue;
    const key = bindingKey(d);
    if (!order.has(key)) order.set(key, position);
    found.set(key, { ...found.get(key), ...kept });
    if (d.state) alternatives.set(key, new Set([...(alternatives.get(key) ?? []), d.alternative]));
  }
  for (const [key, seen] of alternatives) {
    const state = spec.states.find((s) => s.name === key.split("|")[2]);
    state.selectors.forEach((selector, index) => {
      if (!seen.has(index)) findings.push(`state ${state.name} (${key}): the stylesheet has no rule for its selector ${selector}`);
    });
  }
  return { found, findings, order };
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
  if (!/^\.scnx-[a-z0-9_-]+$/.test(spec.anatomy[0].selector)) findings.push(`the first part, the root, must be a single class selector`);
  for (const part of grammar(spec).parts) if (part.rel === null) findings.push(`part ${part.name} is not selected from the root ${spec.anatomy[0].selector}`);
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
  const { found, findings: sheet, order } = stylesheetBindings(css, spec);
  findings.push(...sheet, ...orderFindings(spec, order));
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

/** Selectors Level 4 specificity of one selector, as [ids, classes, types]. */
export function specificity(selector) {
  const of = (node) => {
    const sum = [0, 0, 0];
    const add = (v) => v.forEach((n, i) => (sum[i] += n));
    node.children.forEach((child) => {
      if (child.type === "IdSelector") sum[0]++;
      else if (child.type === "ClassSelector" || child.type === "AttributeSelector") sum[1]++;
      else if (child.type === "TypeSelector" && child.name !== "*") sum[2]++;
      else if (child.type === "PseudoElementSelector") sum[2]++;
      else if (child.type === "PseudoClassSelector") {
        const name = child.name.toLowerCase();
        if (name === "where") return;
        if (["not", "is", "has"].includes(name) && child.children) {
          const list = child.children.first;
          const max = list.children.toArray().map(of).reduce((a, b) => (compare(a, b) >= 0 ? a : b), [0, 0, 0]);
          add(max);
        } else sum[1]++;
      }
    });
    return sum;
  };
  return of(csstree.parse(selector, { context: "selector" }));
}
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * The declarations in force for a part, option values, and state, in
 * cascade order: matching bindings by the specificity of their stylesheet
 * selector, ties by their order in the specification. A repeated property
 * moves to the end, so a later shorthand resets an earlier longhand.
 */
export function effective(spec, part, option, state) {
  const matches = (b) =>
    b.part === part && (!b.state || b.state === state) && Object.entries(b.option ?? {}).every(([k, v]) => option[k] === v);
  const ordered = spec.bindings
    .map((b, index) => ({ b, index, weight: specificity(selectorFor(spec, b)) }))
    .filter(({ b }) => matches(b))
    .sort((x, y) => compare(x.weight, y.weight) || x.index - y.index);
  const out = {};
  for (const { b } of ordered) {
    for (const [property, value] of Object.entries(b.declarations)) {
      delete out[property];
      out[property] = value;
    }
  }
  return out;
}

/** Two properties of one shorthand family (`border-bottom` and `border-bottom-color`). */
const overlap = (a, b) => a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`);

/**
 * CS8: bindings of one part with equal specificity that set overlapping
 * properties must keep the stylesheet's order, because source order decides
 * between them.
 */
export function orderFindings(spec, sourceOrder) {
  const findings = [];
  const rows = spec.bindings.map((b, index) => ({ b, index, key: bindingKey(b), weight: specificity(selectorFor(spec, b)) }));
  for (const x of rows) {
    for (const y of rows) {
      if (x.index >= y.index || x.b.part !== y.b.part || compare(x.weight, y.weight) !== 0) continue;
      const shared = Object.keys(x.b.declarations).some((p) => Object.keys(y.b.declarations).some((q) => overlap(p, q)));
      if (!shared) continue;
      const [sx, sy] = [sourceOrder.get(x.key), sourceOrder.get(y.key)];
      if (sx !== undefined && sy !== undefined && sx > sy) findings.push(`bindings ${x.key} and ${y.key} have equal specificity and overlapping properties; list them in the stylesheet's order`);
    }
  }
  return findings;
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
    // A styled component may pass a prop through to its primitive; the union is then in the primitive's report.
    report: [
      fs.readFileSync(path.join(root, `packages/design-system/api/components.${name}.api.md`), "utf8"),
      ...primitives
        .filter((p) => p.name === spec.primitive)
        .map((p) => fs.readFileSync(path.join(root, `packages/core-ui/api/components.${p.entry.split("/").pop()}.api.md`), "utf8")),
    ].join("\n"),
    primitive: primitives.find((p) => p.name === spec.primitive),
    tokens,
  };
}
