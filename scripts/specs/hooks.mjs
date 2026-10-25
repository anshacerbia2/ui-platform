#!/usr/bin/env node
// Write a styled specification's `hooks` and `hookScope` from the built
// stylesheet (TDD styled HK2, HK5). The specification gate then checks the list
// against the stylesheet in both directions, so this only seeds or refreshes
// it. An existing hook keeps its alias review record (purpose, coverage,
// migration); a new hook gets a first draft of one, which the reviewer reads in
// the diff as part of the component's public hook API (STD-UIP-TKN-001,
// Component Alias Review).
//
//   node scripts/specs/hooks.mjs <component>...   for example: button icon-button

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentHooks, stylesheetBindings } from "./styled.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "packages/design-system/dist");
const css = fs.readFileSync(path.join(dist, "styles/components.css"), "utf8");
const byCss = new Map();
for (const file of fs.readdirSync(path.join(dist, "tokens/json"))) {
  for (const token of JSON.parse(fs.readFileSync(path.join(dist, "tokens/json", file), "utf8")).tokens) byCss.set(token.cssName, token.name);
}
const themes = fs.readdirSync(path.join(dist, "tokens/json")).map((f) => f.replace(/\.json$/, "")).sort((a, b) => (a === "industrial" ? -1 : b === "industrial" ? 1 : a.localeCompare(b)));
// A fallback as a binding template: var(--ds-x-y) is written {x.y}.
const template = (value) =>
  value.replace(/var\((--ds-[a-z0-9-]+)\)/g, (match, name) => {
    const token = byCss.get(name);
    if (!token) throw new Error(`no token for ${name}`);
    return `{${token}}`;
  });

const STATES = ["hover", "pressed", "focus", "selected", "disabled", "invalid", "open", "active"];
const title = (words) => words.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const list = (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

/** A first draft of a hook's alias review record, from what the stylesheet shows. */
function review(spec, component, hook, entry) {
  const state = STATES.find((s) => hook.endsWith(`-${s}`));
  const parts = entry.parts.filter((p) => p !== "root");
  const subject = parts.length > 0 ? `${title(component)}'s ${list(parts)} part` : title(component);
  const options = Object.keys(spec.options ?? {});
  return {
    purpose: `The ${list(entry.properties)} of ${subject}${state ? ` in the ${state} state` : ""}.`,
    coverage: `${list(themes)}, light and dark${options.length > 0 ? `; every ${list(options)} value` : ""}${entry.floor ? `; never below the ${entry.floor} floor` : ""}.`,
    migration: "Added in @scnx/system 2.0.0-beta.0, before v1; additive, no consumer change.",
  };
}

/** Where a product sets the hooks: a scope, and an option attribute within it (decision A, TDD styled HK5). */
function hookScope(spec, hooks) {
  const example = (hooks.find((h) => h.hook.endsWith("-hover")) ?? hooks[0]).hook;
  const option = Object.entries(spec.options ?? {}).find(([, o]) => /^\[data-[a-z-]+=\{value\}\]$/.test(o.selector) && o.values.length > 1);
  const base = "Set a hook on a scope the product owns, not on :root, so a runtime change restyles that scope only";
  if (!option) return `${base}, for example .promo { ${example}: …; }.`;
  const [name, { selector, values, default: fallback }] = option;
  const attribute = /^\[(data-[a-z-]+)=/.exec(selector)[1];
  const value = values.find((v) => v !== fallback) ?? values[0];
  return `${base}. To change one ${name} only, set the hook on [${attribute}] within the scope, for example .promo [${attribute}="${value}"] { ${example}: …; }; without it, the hook applies to every ${name} in the scope.`;
}

const specFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? specFiles(path.join(dir, e.name)) : e.name.endsWith(".spec.json") ? [path.join(dir, e.name)] : []));
const all = specFiles(path.join(root, "packages/design-system/src/components"));

for (const component of process.argv.slice(2)) {
  const file = all.find((f) => path.basename(f) === `${component}.spec.json`);
  if (!file) throw new Error(`no specification for ${component}`);
  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
  const before = new Map((spec.hooks ?? []).map((h) => [h.hook, h]));
  // An entry specification has no anatomy: its hooks are those of the rules in its namespace (TDD styled HK7).
  const { hooks } = spec.kind === "entry" ? { hooks: componentHooks(css, component) } : stylesheetBindings(css, spec);
  const listed = [...hooks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hook, h]) => {
      const entry = {
        hook,
        parts: [...h.parts].sort(),
        properties: [...h.properties].sort(),
        fallbacks: [...h.fallbacks].map(template).sort(),
        floor: [...h.floors][0] ?? null,
      };
      const old = before.get(hook);
      const record = old?.purpose ? { purpose: old.purpose, coverage: old.coverage, migration: old.migration } : review(spec, component, hook, entry);
      return { ...entry, ...record };
    });
  // hookScope sits before hooks, as the schema lists it.
  const out = {};
  for (const [key, value] of Object.entries(spec)) {
    if (key === "hooks" || key === "hookScope") continue;
    out[key] = value;
    if (key === "bindings") {
      out.hookScope = spec.hookScope ?? hookScope(spec, listed);
      out.hooks = listed;
    }
  }
  if (!("hooks" in out) && listed.length > 0) {
    out.hookScope = spec.hookScope ?? hookScope(spec, listed);
    out.hooks = listed;
  }
  fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`${path.relative(root, file)}: ${listed.length} hooks`);
}
