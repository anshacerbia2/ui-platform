#!/usr/bin/env node
// Computed conformance of styled specifications (ADR-UIP-CMP-001 item 5;
// TDD styled CS4). Installs the packed tarballs into a fresh project, server
// renders every styled component once per theme root, option combination, and
// prop-entered state, loads only the published stylesheets in every engine of
// support-matrix.json, enters each interaction state with the pointer, waits
// for its transitions, and fails unless every bound property computes the
// value its declaration template computes in the same root, and every unbound
// opacity computes 1, so state is carried by tokens.
//
//   node scripts/browser-specs.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { browserEngines } from "./browser-engines.mjs";
import { loadSpecs } from "./specs/specs.mjs";
import { combinations, effective, toCss } from "./specs/styled.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

const { specs, findings } = loadSpecs();
if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}
const styled = specs.map((row) => row.spec).filter((spec) => spec.kind === "styled");

// Shorthands the templates may use, and the longhands a browser computes for them.
const LONGHANDS = {
  padding: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  border: ["border-top-width", "border-top-style", "border-top-color", "border-right-width", "border-right-color", "border-bottom-width", "border-bottom-color", "border-left-width", "border-left-color"],
  "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
  background: ["background-color", "background-image"],
  gap: ["row-gap", "column-gap"],
  transition: ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
};
const longhands = (property) => LONGHANDS[property] ?? [property];

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-browser-specs-"));
const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-browser-specs", private: true, type: "module", dependencies }, null, 2));
execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

const manifest = JSON.parse(fs.readFileSync(path.join(dir, "node_modules/@scnx/system/package.json"), "utf8"));
const themes = Object.keys(manifest.exports).map((s) => /^\.\/tokens\/css\/([a-z0-9-]+)\.css$/.exec(s)?.[1]).filter(Boolean);
const stylesheets = ["./styles/components.css", ...themes.map((t) => `./tokens/css/${t}.css`)].map(
  (subpath) => `/node_modules/@scnx/system/${manifest.exports[subpath].replace(/^\.\//, "")}`,
);

// The matrix: one rendered case per theme root, option combination, and
// state entered by props; interaction states reuse the rest-state element.
const cases = [];
for (const spec of styled) {
  for (const option of combinations(spec)) {
    for (const state of [null, ...spec.states]) {
      if (state && !state.enter.props) continue;
      cases.push({ spec, option, state: state?.name ?? "", props: { ...spec.fixture.props, ...option, ...(state?.enter.props ?? {}) } });
    }
  }
}
const modes = ["light", "dark"];
fs.writeFileSync(
  path.join(dir, "render.mjs"),
  `import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
${styled.map((spec, i) => `import * as m${i} from ${JSON.stringify(spec.entry)};`).join("\n")}
const modules = [${styled.map((_, i) => `m${i}`).join(", ")}];
const entries = ${JSON.stringify(styled.map((spec) => spec.entry))};
const cases = ${JSON.stringify(cases.map(({ spec, props }, id) => ({ id, module: styled.indexOf(spec), props })))};
const component = (mod, entry) => Object.values(mod).find((v) => typeof v === "function") ?? (() => { throw new Error("no component in " + entry); })();
const roots = ${JSON.stringify(themes)}.flatMap((theme) => ${JSON.stringify(modes)}.map((mode) =>
  h("div", { "data-scnx-theme": theme, "data-scnx-resolved-mode": mode, "data-root": theme + "/" + mode },
    ...cases.map((c) => h("div", { key: c.id, "data-case": c.id }, h(component(modules[c.module], entries[c.module]), c.props))))));
process.stdout.write(renderToStaticMarkup(h("main", null, ...roots)));
`,
);
const body = execSync("node render.mjs", { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const page = `<!doctype html><html><head><meta charset="utf-8">${stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}</head><body>${body}</body></html>`;
const TYPES = { ".css": "text/css", ".woff2": "font/woff2" };
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (url === "/") return void response.writeHead(200, { "content-type": "text/html" }).end(page);
  const file = path.join(dir, url);
  if (!file.startsWith(dir) || !fs.existsSync(file)) return void response.writeHead(404).end();
  response.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

/** In the page: the case's part, and a probe in the same root carrying the merged declarations. */
function measure({ caseId, root, selector, declarations, properties }) {
  const scope = document.querySelector(`[data-root="${root}"] [data-case="${caseId}"]`);
  const el = scope.matches(selector) ? scope : scope.querySelector(selector);
  if (!el) return { missing: true };
  const probe = document.createElement("span");
  for (const [property, value] of Object.entries(declarations)) probe.style.setProperty(property, value);
  if (!("opacity" in declarations)) probe.style.setProperty("opacity", "1");
  scope.append(probe);
  const have = getComputedStyle(el);
  const want = getComputedStyle(probe);
  const out = Object.fromEntries(properties.map((p) => [p, [have.getPropertyValue(p), want.getPropertyValue(p)]]));
  probe.remove();
  return { values: out };
}

async function settle(tab, handle) {
  await tab.evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined)));
  }, handle);
}

const failures = [];
const result = { scenario: "packed-browser-specs", specs: styled.map((s) => s.entry), themes, engines: [] };
for (const engine of browserEngines()) {
  const browser = await engine.type.launch();
  let checked = 0;
  try {
    const tab = await browser.newPage();
    await tab.goto(`${origin}/`, { waitUntil: "load" });
    for (const theme of themes) {
      for (const mode of modes) {
        const root = `${theme}/${mode}`;
        for (const [caseId, c] of cases.entries()) {
          const states = c.state ? [c.spec.states.find((s) => s.name === c.state)] : [null, ...c.spec.states.filter((s) => s.enter.interaction)];
          for (const state of states) {
            for (const part of c.spec.anatomy) {
              const merged = effective(c.spec, part.name, c.option, state?.name ?? "");
              if (Object.keys(merged).length === 0) continue;
              const declarations = Object.fromEntries(Object.entries(merged).map(([p, v]) => [p, toCss(v)]));
              // State is carried by tokens: an unbound opacity must compute 1 (TDD styled CS4).
              const properties = [...Object.keys(merged).flatMap(longhands), ...("opacity" in merged ? [] : ["opacity"])];
              const handle = await tab.$(`[data-root="${root}"] [data-case="${caseId}"] ${part.selector}, [data-root="${root}"] [data-case="${caseId}"]${part.selector}`);
              if (!handle) {
                failures.push(`${engine.name}: ${c.spec.entry} ${root} case ${JSON.stringify(c.option)}: no ${part.selector}`);
                continue;
              }
              if (state?.enter.interaction) {
                await handle.hover();
                if (state.enter.interaction === "press") await tab.mouse.down();
              }
              await settle(tab, handle);
              const { values, missing } = await tab.evaluate(measure, { caseId, root, selector: part.selector, declarations, properties });
              if (state?.enter.interaction === "press") await tab.mouse.up();
              if (state?.enter.interaction) await tab.mouse.move(0, 0);
              await settle(tab, handle);
              const where = `${engine.name}: ${c.spec.entry} ${part.name} ${JSON.stringify(c.option)} ${state?.name ?? (c.state || "rest")} in ${root}`;
              if (missing) failures.push(`${where}: part not rendered`);
              else {
                for (const [property, [have, want]] of Object.entries(values)) {
                  checked++;
                  if (have !== want) failures.push(`${where}: ${property} computes ${have}, its binding computes ${want}`);
                }
              }
            }
          }
        }
      }
    }
    result.engines.push({ engine: engine.name, version: browser.version(), properties: checked });
  } finally {
    await browser.close();
  }
}
server.close();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "browser-specs-report.json"), `${JSON.stringify({ ...result, failures }, null, 2)}\n`);
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Specification conformance passed: ${styled.length} styled specifications x ${themes.length * modes.length} roots; ${result.engines.map((e) => `${e.engine} ${e.version} ${e.properties} properties`).join(", ")}`,
);
