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
/**
 * Properties a specification's `geometry` records (ADR-UIP-VIS-001 item 6,
 * TDD styled CS14): control and row heights, widths, and icon sizes are
 * component geometry, not tokens.
 */
export const GEOMETRY_PROPERTY = /^(min-|max-)?(block-size|inline-size|height|width)$|^aspect-ratio$/;
const normalizeSelector = (selector) => csstree.generate(csstree.parse(selector, { context: "selector" }));

/** Identity of a binding: part, option values, state. */
export const bindingKey = ({ part, option = {}, state = "" }) =>
  `${part}|${Object.entries(option).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(",")}|${state}`;

/** Split a serialized selector into compound selectors and the combinators between them. */
export function compounds(selector) {
  const parts = [""];
  const combinators = [];
  let depth = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (depth === 0 && (ch === " " || ch === ">" || ch === "+" || ch === "~")) {
      let combinator = ch;
      while (selector[i + 1] === " " || ">+~".includes(selector[i + 1])) {
        i++;
        if (selector[i] !== " ") combinator = selector[i];
      }
      combinators.push(combinator);
      parts.push("");
    } else parts[parts.length - 1] += ch;
  }
  return { compounds: parts, combinators };
}

const continuesName = (rest) => /^[a-z0-9_-]/i.test(rest);

/**
 * A compound and its pseudo-element (TDD styled CS15): a state precedes the
 * pseudo-element, so `[data-part=tab]::before` in the hover state is
 * `[data-part=tab]:hover::before`.
 */
const splitPseudo = (text) => {
  const at = text.indexOf("::");
  return at < 0 ? [text, ""] : [text.slice(0, at), text.slice(at)];
};

/**
 * The selector grammar of a specification. Each part is a selector of one or
 * more compounds (`.scnx-accordion__item`, `.scnx-tabs [data-part=tab]`,
 * `.scnx-table-of-contents__item .scnx-table-of-contents__list`); the first part, the root, is one class
 * `R`. Options and `on: "root"` states add fragments to the root's compound;
 * an option fragment starting with a period is a class on the root element.
 * Other states add fragments to the measured part's last compound, or, with
 * `on: <part>`, to that part's compound written as the measured part's
 * context (`.scnx-accordion__trigger[data-state=open] .scnx-accordion__icon`).
 * All text is normalized as the stylesheet serializes it.
 */
export function grammar(spec) {
  const R = normalizeSelector(spec.anatomy[0].selector);
  const strip = (base, fragment) => normalizeSelector(`${base}${fragment}`).slice(base.length);
  const parts = spec.anatomy.map((part, index) => {
    const full = normalizeSelector(part.selector);
    return { name: part.name, full, ...compounds(full), root: index === 0, extends: part.extends ?? null };
  });
  const root = [];
  const own = [];
  const anchored = new Map();
  for (const [option, { values, selector }] of Object.entries(spec.options)) {
    for (const value of values) root.push({ kind: "option", option, value, text: strip(R, selector.replace("{value}", value)), standalone: selector.startsWith(".") });
  }
  for (const state of spec.states) {
    const on = state.on ?? "part";
    state.selectors.forEach((selector, index) => {
      const fragment = { kind: "state", state: state.name, index };
      if (on === "root") root.push({ ...fragment, text: strip(R, selector) });
      else if (on === "part") own.push({ ...fragment, text: strip(R, selector) });
      else anchored.set(on, [...(anchored.get(on) ?? []), { ...fragment, text: strip(R, selector) }]);
    });
  }
  const longest = (a, b) => b.text.length - a.text.length;
  root.sort(longest);
  own.sort(longest);
  for (const list of anchored.values()) list.sort(longest);
  return { R, parts: parts.sort((a, b) => b.compounds.length - a.compounds.length || b.full.length - a.full.length), root, own, anchored };
}

/** Consume fragments from the start of `rest`; null when something is left or two states occur. */
function consume(rest, list, found) {
  for (let hit = list.find((f) => rest.startsWith(f.text)); hit; hit = list.find((f) => rest.startsWith(f.text))) {
    if (hit.kind === "option") found.option[hit.option] = hit.value;
    else if (found.state) return null;
    else [found.state, found.alternative] = [hit.state, hit.index];
    rest = rest.slice(hit.text.length);
  }
  return rest;
}

/** A compound that selects the root element: `R` and fragments, or root class fragments alone. */
function rootCompound(text, g) {
  if (g.root.some((f) => f.standalone && text.startsWith(f.text) && !continuesName(text.slice(f.text.length)))) return `${g.R}${text}`;
  return text.startsWith(g.R) && !continuesName(text.slice(g.R.length)) ? text : null;
}

/**
 * The selector of one identity. `locate` (default) finds its element in a
 * rendered fixture; `stylesheet` is the form the stylesheet writes, which
 * omits the root's class when only class fragments select the root, and gives
 * the specificity the cascade uses.
 */
export function selectorFor(spec, { part, option = {}, state = "", alternative = 0 }, form = "locate") {
  const g = grammar(spec);
  const target = g.parts.find((p) => p.name === part);
  const pick = (list) => (list ?? []).filter((f) => (f.kind === "option" ? option[f.option] === f.value : f.state === state && f.index === alternative));
  const rootFragments = pick(g.root);
  const bare = form === "stylesheet" && rootFragments.length > 0 && rootFragments.every((f) => f.standalone);
  const rootText = `${bare ? "" : g.R}${rootFragments.map((f) => f.text).join("")}`;
  const c = [...target.compounds];
  const ownText = pick(g.own).map((f) => f.text).join("");
  let prefix = "";
  if (c[0] === g.R) c[0] = `${rootText}${c[0].slice(g.R.length)}`;
  else if (rootFragments.length > 0) prefix = `${rootText} `;
  const [host, pseudo] = splitPseudo(c[c.length - 1]);
  c[c.length - 1] = `${host}${ownText}${pseudo}`;
  const stateDef = spec.states.find((s) => s.name === state);
  if (stateDef && stateDef.on && stateDef.on !== "root" && stateDef.on !== "part") {
    const anchor = g.parts.find((p) => p.name === stateDef.on);
    prefix += `${anchor.full}${pick(g.anchored.get(stateDef.on)).map((f) => f.text).join("")} `;
  }
  return prefix + c.map((text, i) => (i === 0 ? text : `${target.combinators[i - 1] === " " ? " " : target.combinators[i - 1]}${text}`)).join("");
}

/** Map one serialized selector to a binding identity, null when the specification does not describe it, undefined when it is another component's. */
function describe(selector, g) {
  const s = compounds(selector);
  const ours = (text) => rootCompound(text, g) !== null || g.parts.some((p) => text.startsWith(p.compounds[0]) && !continuesName(text.slice(p.compounds[0].length)));
  // A rule belongs to the component its first compound starts at: `.scnx-edge-layout__header
  // .scnx-navbar` is EdgeLayout's rule about a Navbar, not Navbar's.
  const first = s.compounds[0];
  if (!ours(first)) {
    // A BEM element or modifier of the root that no part declares is undescribed, not foreign.
    return first.startsWith(g.R) && /^(--|__)/.test(first.slice(g.R.length)) ? null : undefined;
  }
  for (const target of g.parts) {
    const m = target.compounds.length;
    const start = s.compounds.length - m;
    if (start < 0) continue;
    if (target.combinators.some((k, i) => k !== s.combinators[start + i])) continue;
    const found = { option: {}, state: "", alternative: -1 };
    let ok = true;
    for (let j = 0; j < m && ok; j++) {
      let text = s.compounds[start + j];
      let base = target.compounds[j];
      if (j === m - 1) {
        const [host, pseudo] = splitPseudo(base);
        if (pseudo && !text.endsWith(pseudo)) {
          ok = false;
          break;
        }
        [base, text] = [host, pseudo ? text.slice(0, -pseudo.length) : text];
      }
      if (base === g.R) text = rootCompound(text, g) ?? "";
      if (!text.startsWith(base) || continuesName(text.slice(base.length))) {
        ok = false;
        break;
      }
      const lists = [...(base === g.R ? g.root : []), ...(j === m - 1 ? g.own : [])];
      const rest = consume(text.slice(base.length), lists, found);
      if (rest !== "") ok = false;
    }
    if (!ok) continue;
    if (start === 0) return { part: target.name, ...found };
    if (start !== 1 || ![" ", ">"].includes(s.combinators[0])) continue;
    const context = s.compounds[0];
    const asRoot = rootCompound(context, g);
    if (asRoot !== null) {
      if (consume(asRoot.slice(g.R.length), g.root, found) === "") return { part: target.name, ...found };
      continue;
    }
    for (const anchor of g.parts.filter((p) => p.compounds.length === 1 && !p.root)) {
      if (!context.startsWith(anchor.full) || continuesName(context.slice(anchor.full.length))) continue;
      if (consume(context.slice(anchor.full.length), g.anchored.get(anchor.name) ?? [], found) === "" && found.state) return { part: target.name, ...found };
    }
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
  const geometry = new Map();
  const alternatives = new Map();
  const order = new Map();
  for (const [position, { d, declarations }] of rows.entries()) {
    const sizes = Object.fromEntries(
      Object.entries(declarations).filter(([p, v]) => GEOMETRY_PROPERTY.test(p) && !v.includes("var(--ds-") && !tokenProperties.get(d.part)?.has(p)),
    );
    if (Object.keys(sizes).length > 0) geometry.set(bindingKey(d), { ...geometry.get(bindingKey(d)), ...sizes });
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
  return { found, geometry, findings, order };
}

/** Option unions of the public-API report: `name?: "a" | "b";`. */
export function apiUnion(report, option) {
  const line = new RegExp(`\\b${option}\\??:\\s*([^;]+);`).exec(report)?.[1];
  if (!line) return null;
  const values = new Set();
  const resolve = (text, depth) => {
    for (const m of text.matchAll(/"([^"]+)"/g)) values.add(m[1]);
    if (/\bboolean\b/.test(text)) ["false", "true"].forEach((v) => values.add(v));
    // A named union (`weight?: DividerWeight`) resolves through its type alias.
    for (const [name] of text.replace(/"[^"]*"/g, "").matchAll(/\b[A-Z][A-Za-z0-9]*\b/g)) {
      const alias = new RegExp(`type ${name}\\s*=\\s*([^;]+);`).exec(report)?.[1];
      if (alias && depth < 5) resolve(alias, depth + 1);
    }
  };
  resolve(line, 0);
  return [...values];
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
  for (const part of spec.anatomy) {
    if (part.extends && !spec.anatomy.some((p) => p.name === part.extends)) findings.push(`part ${part.name} extends undeclared part ${part.extends}`);
  }
  for (const state of spec.states) {
    if (state.on && !["root", "part"].includes(state.on) && !spec.anatomy.some((p) => p.name === state.on)) findings.push(`state ${state.name} is on undeclared part ${state.on}`);
  }
  for (const part of spec.anatomy) {
    if (part.primitivePart && primitive && !primitive.parts.some((p) => p.name === part.primitivePart)) {
      findings.push(`part ${part.name} styles ${part.primitivePart}, which ${spec.primitive} does not declare`);
    }
  }
  for (const [option, { values, default: fallback }] of Object.entries(spec.options)) {
    if (fallback !== null && !values.includes(fallback)) findings.push(`option ${option}: default ${fallback} is not one of its values`);
    const union = apiUnion(report, option);
    if (!union) findings.push(`option ${option}: the public-API report declares no such prop`);
    else if ([...union].sort().join() !== [...values].sort().join()) findings.push(`option ${option}: values ${values.join(" | ")} differ from the published union ${union.join(" | ")}`);
  }
  const target = (binding, kind) => {
    if (!parts.has(binding.part)) findings.push(`${kind} names undeclared part ${binding.part}`);
    if (binding.state && !states.has(binding.state)) findings.push(`${kind} names undeclared state ${binding.state}`);
    for (const [option, value] of Object.entries(binding.option ?? {})) {
      if (!spec.options[option]?.values.includes(value)) findings.push(`${kind} names undeclared option value ${option}=${value}`);
    }
  };
  const declared = new Map();
  for (const binding of spec.bindings) {
    target(binding, "binding");
    for (const template of Object.values(binding.declarations)) {
      // A token is named by its canonical path (STD-UIP-TKN-001), as the token output lists it.
      for (const token of tokensIn(template)) if (!tokens.has(token)) findings.push(`binding names token ${token}, which is not a canonical token name of the token output`);
    }
    const key = bindingKey(binding);
    if (declared.has(key)) findings.push(`two bindings for ${key}`);
    declared.set(key, Object.fromEntries(Object.entries(binding.declarations).map(([p, v]) => [p, normalizeValue(toCss(v))])));
  }
  const { found, geometry, findings: sheet, order } = stylesheetBindings(css, spec);
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
  // CS14: a specification that records geometry records all of it, so a size
  // literal cannot change or appear without its specification changing.
  if (spec.geometry) {
    const recorded = new Map();
    for (const entry of spec.geometry) {
      target(entry, "geometry");
      const key = bindingKey(entry);
      if (recorded.has(key)) findings.push(`two geometry entries for ${key}`);
      for (const [property, value] of Object.entries(entry.declarations)) {
        if (!GEOMETRY_PROPERTY.test(property)) findings.push(`geometry ${key}: ${property} is not a size property`);
        if (tokensIn(value).length > 0) findings.push(`geometry ${key}: ${property} names a token; a token-bound size is a binding`);
      }
      recorded.set(key, Object.fromEntries(Object.entries(entry.declarations).map(([p, v]) => [p, tokensIn(v).length > 0 ? v : normalizeValue(v)])));
    }
    for (const key of new Set([...recorded.keys(), ...geometry.keys()])) {
      const want = recorded.get(key) ?? {};
      const have = geometry.get(key) ?? {};
      for (const property of new Set([...Object.keys(want), ...Object.keys(have)])) {
        if (!(property in have)) findings.push(`geometry ${key}: records ${property}, which the stylesheet does not declare as a literal`);
        else if (!(property in want)) findings.push(`geometry ${key}: the stylesheet declares ${property}: ${have[property]}, which the geometry does not record`);
        else if (want[property] !== have[property]) findings.push(`geometry ${key}: ${property} is ${have[property]} in the stylesheet, ${want[property]} in the specification`);
      }
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
  // A part that `extends` another also takes that part's bindings (a nested list is a list).
  const chain = [];
  for (let p = part; p; p = spec.anatomy.find((a) => a.name === p)?.extends) chain.push(p);
  const matches = (b) =>
    chain.includes(b.part) && (!b.state || b.state === state) && Object.entries(b.option ?? {}).every(([k, v]) => option[k] === v);
  const ordered = spec.bindings
    .map((b, index) => ({ b, index, weight: specificity(selectorFor(spec, b, "stylesheet")) }))
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
  const rows = spec.bindings.map((b, index) => ({ b, index, key: bindingKey(b), weight: specificity(selectorFor(spec, b, "stylesheet")) }));
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
  const defaults = Object.fromEntries(Object.entries(spec.options).filter(([, o]) => o.default !== null).map(([k, o]) => [k, o.default]));
  const key = (combo) => JSON.stringify(Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)));
  const out = new Map([[key(defaults), defaults]]);
  const add = (combo) => out.set(key(combo), combo);
  // Each option varies alone from the defaults (options do not interact) ...
  for (const [option, { values }] of Object.entries(spec.options)) for (const value of values) add({ ...defaults, [option]: value });
  // ... except options a binding names together, which vary jointly.
  for (const binding of spec.bindings) {
    const joint = Object.keys(binding.option ?? {});
    if (joint.length < 2) continue;
    const product = joint.reduce((acc, option) => acc.flatMap((combo) => spec.options[option].values.map((value) => ({ ...combo, [option]: value }))), [defaults]);
    product.forEach(add);
  }
  return [...out.values()];
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

/** A published declaration file and the chunks it imports. */
function declarations(file, seen = new Set()) {
  if (!fs.existsSync(file) || seen.has(file)) return [];
  seen.add(file);
  const text = fs.readFileSync(file, "utf8");
  const chunks = [...text.matchAll(/from ["'](\.{1,2}\/[^"']+)\.js["']/g)].map((m) => path.resolve(path.dirname(file), `${m[1]}.d.ts`));
  // A prop passed through to a primitive is declared in @scnx/core-ui's published declarations.
  const core = [...text.matchAll(/from ["']@scnx\/core-ui\/(components|hooks|providers)\/([a-z0-9-]+)["']/g)].map((m) => path.join(root, "packages/core-ui/dist", m[1], m[2], "index.d.ts"));
  return [text, ...[...chunks, ...core].flatMap((c) => declarations(c, seen))];
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
      // The published declarations, where a union the report omits (a forgotten export) is spelled out.
      ...declarations(path.join(root, "packages/design-system/dist/components", name, "index.d.ts")),
    ].join("\n"),
    primitive: primitives.find((p) => p.name === spec.primitive),
    tokens,
  };
}
