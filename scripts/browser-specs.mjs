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
import { combinations, effective, selectorFor, toCss } from "./specs/styled.mjs";

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
  "border-width": ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"],
  "border-color": ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
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
// state entered by props. States the fixture tree already renders (for
// example a selected tab) and pointer states are measured in the rest case.
const cases = [];
for (const spec of styled) {
  for (const option of combinations(spec)) {
    for (const state of [null, ...spec.states.filter((s) => s.enter.props)]) {
      // A boolean option's values are "false" and "true"; the prop takes the boolean.
      const props = Object.fromEntries(Object.entries(option).map(([k, v]) => [k, spec.options[k].values.join() === "false,true" ? v === "true" : v]));
      cases.push({ spec, option, state: state?.name ?? "", rootProps: { ...props, ...(state?.enter.props ?? {}) } });
    }
  }
}
const treeOf = (spec) => spec.fixture.tree ?? { type: null, props: spec.fixture.props };
const modes = ["light", "dark"];
fs.writeFileSync(
  path.join(dir, "render.mjs"),
  `import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
${styled.map((spec, i) => `import * as m${i} from ${JSON.stringify(spec.entry)};`).join("\n")}
const modules = [${styled.map((_, i) => `m${i}`).join(", ")}];
const trees = ${JSON.stringify(styled.map(treeOf))};
const cases = ${JSON.stringify(cases.map(({ spec, rootProps }, id) => ({ id, module: styled.indexOf(spec), rootProps })))};
// A node type is an export ("Tabs"), a sub-component ("Tabs.List"), or an HTML element ("span").
const resolve = (mod, type) => {
  if (type === null) return Object.values(mod).find((v) => typeof v === "function");
  if (/^[a-z]/.test(type)) return type;
  const found = type.split(".").reduce((value, key) => value?.[key], mod);
  if (!found) throw new Error("no export " + type);
  return found;
};
const build = (mod, node, extra) => typeof node === "string" ? node
  : h(resolve(mod, node.type), { ...node.props, ...extra }, ...(node.children ?? []).map((child) => build(mod, child)));
const roots = ${JSON.stringify(themes)}.flatMap((theme) => ${JSON.stringify(modes)}.map((mode) =>
  h("div", { key: theme + mode, "data-scnx-theme": theme, "data-scnx-resolved-mode": mode, "data-root": theme + "/" + mode },
    ...cases.map((c) => h("div", { key: c.id, "data-case": c.id }, build(modules[c.module], trees[c.module], c.rootProps))))));
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

/**
 * In the page: find the case's element of one identity (the first element
 * matching its selector and none of the excluded state selectors), mark it,
 * and measure it, or its pseudo-element, against a probe in the same case
 * carrying the merged declarations.
 */
function measure({ caseId, root, selector, exclude, declarations, properties, mark, marked }) {
  const scope = document.querySelector(`[data-root="${root}"] [data-case="${caseId}"]`);
  const [host, pseudo] = selector.includes("::") ? [selector.slice(0, selector.indexOf("::")), selector.slice(selector.indexOf("::"))] : [selector, null];
  // An element whose state was just entered is measured as marked; otherwise the first match in no excluded state.
  const el = marked ? scope.querySelector("[data-spec-target]") : [...scope.querySelectorAll(host)].find((candidate) => !exclude.some((x) => candidate.matches(x)));
  if (!marked) document.querySelectorAll("[data-spec-target]").forEach((old) => old.removeAttribute("data-spec-target"));
  if (!el) return { missing: true };
  // A vendor pseudo-element (::-webkit-scrollbar) exists only in engines that support it.
  if (pseudo && !CSS.supports(`selector(${pseudo})`)) return { unsupported: true };
  if (mark) {
    el.setAttribute("data-spec-target", "");
    return { marked: true };
  }
  const probe = document.createElement("span");
  // A border or outline width computes 0 without a style; the style may be a literal the
  // bindings do not name, so the probe takes the element's computed style first.
  const element = getComputedStyle(el);
  for (const side of ["top", "right", "bottom", "left"]) probe.style.setProperty(`border-${side}-style`, element.getPropertyValue(`border-${side}-style`));
  probe.style.setProperty("outline-style", element.getPropertyValue("outline-style"));
  for (const [property, value] of Object.entries(declarations)) probe.style.setProperty(property, value);
  if (!("opacity" in declarations)) probe.style.setProperty("opacity", "1");
  scope.append(probe);
  const have = getComputedStyle(el, pseudo);
  const want = getComputedStyle(probe);
  const out = Object.fromEntries(properties.map((p) => [p, [have.getPropertyValue(p), want.getPropertyValue(p)]]));
  probe.remove();
  return { values: out };
}

/** Wait for the transitions of every element of a case. */
async function settle(tab, root, caseId) {
  await tab.evaluate(async ({ root, caseId }) => {
    const scope = document.querySelector(`[data-root="${root}"] [data-case="${caseId}"]`);
    await Promise.all(scope.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined)));
  }, { root, caseId });
}

/** Run a fixture activation (TDD styled CS7) on the case's root element. */
async function activate(tab, spec, root, caseId, on) {
  if (spec.fixture.activate !== "showModal") return;
  await tab.evaluate(({ root, caseId, selector, on }) => {
    const el = document.querySelector(`[data-root="${root}"] [data-case="${caseId}"] ${selector}`);
    if (on) el.showModal();
    else el.close();
  }, { root, caseId, selector: spec.anatomy[0].selector, on });
}

const failures = [];
const result = { scenario: "packed-browser-specs", specs: styled.map((s) => s.entry), themes, engines: [] };
for (const engine of browserEngines()) {
  const browser = await engine.type.launch();
  let checked = 0;
  const measuredParts = new Set();
  const measuredStates = new Set();
  try {
    const tab = await browser.newPage();
    await tab.goto(`${origin}/`, { waitUntil: "load" });
    for (const theme of themes) {
      for (const mode of modes) {
        const root = `${theme}/${mode}`;
        for (const [caseId, c] of cases.entries()) {
          const { spec } = c;
          const states = c.state ? [c.state] : ["", ...spec.states.filter((s) => s.enter.fixture || s.enter.interaction || s.enter.attribute).map((s) => s.name)];
          await activate(tab, spec, root, caseId, true);
          for (const stateName of states) {
            const state = spec.states.find((s) => s.name === stateName);
            const pointer = state?.enter.interaction;
            const attribute = state?.enter.attribute;
            for (const part of spec.anatomy) {
              // A state is measured on the parts it binds; every part is measured at rest.
              if (stateName && !c.state && !spec.bindings.some((b) => b.part === part.name && b.state === stateName)) continue;
              const merged = effective(spec, part.name, c.option, stateName);
              if (Object.keys(merged).length === 0) continue;
              const declarations = Object.fromEntries(Object.entries(merged).map(([p, v]) => [p, toCss(v)]));
              // State is carried by tokens: an unbound opacity must compute 1 (TDD styled CS4).
              // A percentage binding (a Divider's 100% length) resolves against the element's
              // container, which the probe does not share, so it is recorded but not measured.
              // A radius percentage computes as written (IconButton's 50% circle), so it is measured.
              const percentage = (p, v) => !/radius/.test(p) && /^\s*-?[\d.]+%\s*$/.test(v);
              const properties = [...Object.entries(merged).filter(([p, v]) => !percentage(p, v)).map(([p]) => p).flatMap(longhands), ...("opacity" in merged ? [] : ["opacity"])];
              // A bound border width must draw: its side's style may not be none (TDD styled CS9).
              // The last declaration that sets a side's width decides, in cascade order (`border-bottom: 0` after `border`).
              const sideBound = {};
              for (const [p, v] of Object.entries(merged)) {
                if (!/^border(-(top|right|bottom|left))?(-width)?$/.test(p)) continue;
                const side = /(top|right|bottom|left)/.exec(p)?.[1];
                for (const s of side ? [side] : ["top", "right", "bottom", "left"]) sideBound[s] = v.includes("{dimension.border-width.");
              }
              const drawn = Object.entries(sideBound).filter(([, bound]) => bound).map(([side]) => `border-${side}-style`);
              properties.push(...drawn.filter((p) => !properties.includes(p)));
              // A pointer or rest state is measured on an element in no part-level state.
              // An interaction or a set attribute is entered on an element in no part-level state.
              const located = pointer || attribute ? "" : stateName;
              const selector = selectorFor(spec, { part: part.name, option: c.option, state: located });
              const exclude = located || state?.on === "root"
                ? []
                : spec.states.filter((s) => (s.on ?? "part") === "part" && !s.enter.interaction && spec.bindings.some((b) => b.part === part.name && b.state === s.name)).flatMap((s) => s.selectors.map((_, alternative) => selectorFor(spec, { part: part.name, option: c.option, state: s.name, alternative })));
              const where = `${engine.name}: ${spec.entry} ${part.name} ${JSON.stringify(c.option)} ${stateName || "rest"} in ${root}`;
              const args = { caseId, root, selector, exclude, declarations, properties };
              // A state on another part (`on: "trigger"`) is entered on that part's element, not the measured one.
              const entering = state && state.on && !["root", "part"].includes(state.on);
              if (pointer || attribute) {
                const markArgs = entering ? { ...args, selector: selectorFor(spec, { part: state.on, option: c.option }), exclude: [] } : args;
                const { missing } = await tab.evaluate(measure, { ...markArgs, mark: true });
                if (missing) continue;
                const target = await tab.$("[data-spec-target]");
                if (attribute) await target.evaluate((el, attrs) => Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)), attribute);
                if (pointer === "hover" || pointer === "press") {
                  try {
                    await target.hover({ timeout: 5000 });
                  } catch {
                    failures.push(`${where}: the element is not visible, so the pointer cannot enter ${stateName}`);
                    continue;
                  }
                }
                if (pointer === "press") await tab.mouse.down();
                // A script focus matches :focus-visible on a button only after keyboard input, and
                // engines count it differently: Chromium after any keypress (Shift, which does
                // nothing), Firefox and WebKit through focus({ focusVisible: true }). If neither
                // holds, focus arrives by Tab from a sentinel placed just before the part.
                if (pointer === "focus") {
                  await tab.keyboard.press("Shift");
                  await target.evaluate((el) => el.focus({ focusVisible: true }));
                  if (!(await target.evaluate((el) => el.matches(":focus-visible")))) {
                    await target.evaluate((el) => {
                      const sentinel = document.createElement("span");
                      sentinel.tabIndex = 0;
                      sentinel.setAttribute("data-spec-sentinel", "");
                      el.before(sentinel);
                      sentinel.focus();
                    });
                    await tab.keyboard.press("Tab");
                    await tab.evaluate(() => document.querySelector("[data-spec-sentinel]")?.remove());
                  }
                }
                if (pointer === "focus-within") await target.evaluate((el) => el.querySelector("a[href], button:not(:disabled), input:not(:disabled), select, textarea, [tabindex]:not([tabindex='-1'])")?.focus());
                if (attribute) await target.evaluate((el) => el.setAttribute("data-spec-entered", ""));
                if (entering) await tab.evaluate(() => document.querySelectorAll("[data-spec-target]").forEach((el) => el.removeAttribute("data-spec-target")));
              }
              await settle(tab, root, caseId);
              const { values, missing, unsupported } = await tab.evaluate(measure, { ...args, marked: Boolean((pointer || attribute) && !entering) });
              if (pointer === "press") await tab.mouse.up();
              if (pointer?.startsWith("focus")) await tab.evaluate(() => document.activeElement?.blur());
              if (attribute) {
                await tab.evaluate((attrs) => {
                  const el = document.querySelector("[data-spec-entered]");
                  el?.removeAttribute("data-spec-entered");
                  Object.keys(attrs).forEach((k) => el?.removeAttribute(k));
                }, attribute);
              }
              if (pointer || attribute) {
                await tab.mouse.move(0, 0);
                await settle(tab, root, caseId);
              }
              if (missing) continue;
              measuredParts.add(`${spec.entry} ${part.name}`);
              if (stateName && spec.bindings.some((b) => b.part === part.name && b.state === stateName)) measuredStates.add(`${spec.entry} ${stateName}`);
              if (unsupported) continue;
              for (const property of drawn) {
                if (values[property]?.[0] === "none") failures.push(`${where}: ${property} is none, so the bound border width draws nothing`);
              }
              for (const [property, [have, want]] of Object.entries(values)) {
                checked++;
                if (have !== want) failures.push(`${where}: ${property} computes ${have}, its binding computes ${want}`);
              }
            }
          }
          await activate(tab, spec, root, caseId, false);
        }
      }
    }
    // A part may render only in some states (an error message); it must be measured at least once.
    for (const spec of styled) {
      for (const part of spec.anatomy) {
        const bound = spec.bindings.some((b) => b.part === part.name);
        if (bound && !measuredParts.has(`${spec.entry} ${part.name}`)) failures.push(`${engine.name}: ${spec.entry} ${part.name} was never rendered by the fixture`);
      }
      // Every bound state must have been entered and measured at least once.
      for (const state of spec.states) {
        if (spec.bindings.some((b) => b.state === state.name) && !measuredStates.has(`${spec.entry} ${state.name}`)) failures.push(`${engine.name}: ${spec.entry} state ${state.name} was never measured`);
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
