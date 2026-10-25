#!/usr/bin/env node
// Write a styled specification's `hooks` from the built stylesheet (TDD styled
// HK2). The specification gate then checks the list against the stylesheet in
// both directions, so this only seeds or refreshes it; a reviewer reads the
// diff as the component's public hook API.
//
//   node scripts/specs/hooks.mjs <component>...   for example: button icon-button

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stylesheetBindings } from "./styled.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "packages/design-system/dist");
const css = fs.readFileSync(path.join(dist, "styles/components.css"), "utf8");
const byCss = new Map();
for (const file of fs.readdirSync(path.join(dist, "tokens/json"))) {
  for (const token of JSON.parse(fs.readFileSync(path.join(dist, "tokens/json", file), "utf8")).tokens) byCss.set(token.cssName, token.name);
}
// A fallback as a binding template: var(--ds-x-y) is written {x.y}.
const template = (value) =>
  value.replace(/var\((--ds-[a-z0-9-]+)\)/g, (match, name) => {
    const token = byCss.get(name);
    if (!token) throw new Error(`no token for ${name}`);
    return `{${token}}`;
  });

const specFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? specFiles(path.join(dir, e.name)) : e.name.endsWith(".spec.json") ? [path.join(dir, e.name)] : []));
const all = specFiles(path.join(root, "packages/design-system/src/components"));

for (const component of process.argv.slice(2)) {
  const file = all.find((f) => path.basename(f) === `${component}.spec.json`);
  if (!file) throw new Error(`no specification for ${component}`);
  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
  const { hooks } = stylesheetBindings(css, spec);
  spec.hooks = [...hooks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hook, h]) => ({
      hook,
      properties: [...h.properties].sort(),
      fallbacks: [...h.fallbacks].map(template).sort(),
      floor: [...h.floors][0] ?? null,
    }));
  fs.writeFileSync(file, `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`${path.relative(root, file)}: ${spec.hooks.length} hooks`);
}
