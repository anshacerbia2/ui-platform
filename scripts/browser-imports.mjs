#!/usr/bin/env node
// PLAN P0 row 10b import side-effect gate (TDD packaging PKG-008, E1-E4).
// Installs the packed tarballs into a fresh project and bundles one module per
// public JavaScript entry with the workspace's esbuild; React and React DOM go
// into a shared chunk the page loads first. Each entry is then imported alone
// in a fresh Chromium page under a strict CSP (no 'unsafe-eval'), and the
// import fails the gate if it:
// - mutates the DOM (any node, attribute, or text, head included);
// - adds a global, or a property to a built-in prototype;
// - touches localStorage, sessionStorage, or cookies;
// - requests anything beyond its own module chunks (fetch, XHR, WebSocket,
//   EventSource, beacon, worker, or any resource load);
// - schedules a timer, frame, idle callback, or microtask;
// - adds an event listener or defines a custom element;
// - adds or edits a stylesheet;
// - records a CSP violation (for example, dynamic evaluation).
// One negative-control module per category must be caught, which proves each
// detector works.
//
//   node scripts/browser-imports.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

// The workspace's own esbuild (the one tsup uses) bundles the probes; it
// resolves imports from the fixture project, so the bundles use the packs.
const esbuild = createRequire(createRequire(path.resolve("packages/design-system/package.json")).resolve("tsup"))("esbuild");

const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'";

// Each negative control performs exactly one category of side effect.
const NEGATIVE = {
  dom: `document.body.setAttribute("data-touched", "");`,
  global: `globalThis.__scnxLeak = 1;`,
  prototype: `Object.defineProperty(Array.prototype, "scnxLeak", { value: 1, configurable: true });`,
  storage: `localStorage.setItem("scnx", "1");`,
  cookie: `document.cookie = "scnx=1";`,
  network: `fetch("/beacon").catch(() => {});`,
  timer: `setTimeout(() => {}, 0);`,
  microtask: `queueMicrotask(() => {});`,
  listener: `window.addEventListener("resize", () => {});`,
  "custom-element": `customElements.define("scnx-leak", class extends HTMLElement {});`,
  stylesheet: `document.adoptedStyleSheets = [...document.adoptedStyleSheets, new CSSStyleSheet()];`,
  eval: `try { new Function("return 1")(); } catch {}`,
};

const entries = [];
for (const pkg of packReport.packages) {
  for (const subpath of Object.keys(pkg.environments)) entries.push(`${pkg.name}${subpath.slice(1)}`);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-browser-imports-"));
const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-browser-imports", private: true, type: "module", dependencies }, null, 2));

// The harness is a plain module: it loads React, records the baseline, wraps
// every observed API with the originals saved first, imports one probe, waits
// one macrotask through the saved setTimeout, and reports the differences
// through the console, so the driver never polls inside the page.
const HARNESS = `const probe = new URL(location.href).searchParams.get("probe");
const violations = [];
document.addEventListener("securitypolicyviolation", (event) => violations.push(event.effectiveDirective + " " + event.blockedURI));
await import("/out/preload.js");

const PROTOTYPES = { Object: Object.prototype, Array: Array.prototype, Function: Function.prototype, String: String.prototype, Promise: Promise.prototype, EventTarget: EventTarget.prototype, Node: Node.prototype, Element: Element.prototype, HTMLElement: HTMLElement.prototype };
const ownKeys = (object) => Reflect.ownKeys(object).map(String);
const storage = () => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]);
const before = {
  globals: new Set(ownKeys(window)),
  prototypes: Object.fromEntries(Object.entries(PROTOTYPES).map(([name, proto]) => [name, new Set(ownKeys(proto))])),
  storage: storage(),
  styleSheets: document.styleSheets.length,
  adopted: document.adoptedStyleSheets.length,
  resources: performance.getEntriesByType("resource").length,
};

const calls = [];
const record = (kind) => calls.push(kind);
const wrap = (owner, name, kind) => {
  const original = owner[name];
  if (typeof original !== "function") return;
  owner[name] = function (...args) {
    record(kind + ":" + name);
    return original.apply(this, args);
  };
};
const realSetTimeout = window.setTimeout.bind(window);
for (const name of ["setTimeout", "setInterval", "requestAnimationFrame", "requestIdleCallback", "queueMicrotask"]) wrap(window, name, "timer");
for (const name of ["fetch"]) wrap(window, name, "network");
wrap(navigator, "sendBeacon", "network");
wrap(XMLHttpRequest.prototype, "open", "network");
wrap(EventTarget.prototype, "addEventListener", "listener");
wrap(customElements, "define", "custom-element");
wrap(CSSStyleSheet.prototype, "insertRule", "stylesheet");
wrap(CSSStyleSheet.prototype, "replace", "stylesheet");
wrap(CSSStyleSheet.prototype, "replaceSync", "stylesheet");
for (const name of ["WebSocket", "EventSource", "Worker", "SharedWorker"]) {
  const Original = window[name];
  if (typeof Original !== "function") continue;
  window[name] = new Proxy(Original, { construct(target, args) { record("network:" + name); return Reflect.construct(target, args); } });
}
const mutations = [];
const observer = new MutationObserver((records) => mutations.push(...records.map((r) => r.type + " " + (r.target.nodeName || ""))));
observer.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
const wrapped = new Set(["setTimeout", "setInterval", "requestAnimationFrame", "requestIdleCallback", "queueMicrotask", "fetch", "WebSocket", "EventSource", "Worker", "SharedWorker"]);

let error = null;
try {
  await import("/out/" + probe + ".js");
} catch (e) {
  error = String(e);
}
await new Promise((resolve) => realSetTimeout(resolve, 100));
observer.disconnect();
mutations.push(...observer.takeRecords().map((r) => r.type + " " + (r.target.nodeName || "")));

const added = (set, now) => now.filter((key) => !set.has(key));
// The browser's own favicon request is not caused by the probe.
const ownResource = (name) => new URL(name).pathname.startsWith("/out/") || new URL(name).pathname === "/favicon.ico";
const findings = {
  dom: mutations,
  global: added(before.globals, ownKeys(window)).filter((key) => !wrapped.has(key)),
  prototype: Object.entries(PROTOTYPES).flatMap(([name, proto]) => added(before.prototypes[name], ownKeys(proto)).map((key) => name + ".prototype." + key)),
  storage: storage() === before.storage ? [] : ["storage or cookies changed"],
  calls,
  resources: performance.getEntriesByType("resource").slice(before.resources).map((entry) => entry.name).filter((name) => !ownResource(name)),
  stylesheet: document.styleSheets.length !== before.styleSheets || document.adoptedStyleSheets.length !== before.adopted ? ["stylesheet list changed"] : [],
  csp: violations,
};
console.log("SCNX_IMPORT_RESULT " + JSON.stringify({ probe, error, findings }));
`;

const report = { schemaVersion: 1, csp: CSP, entries: [], negativeControls: [] };
let failed = false;
let server;
const browser = await chromium.launch();
try {
  execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

  const src = path.join(dir, "src");
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, "preload.js"), `import "react";\nimport "react/jsx-runtime";\nimport "react-dom";\nimport "react-dom/client";\n`);
  const probes = {};
  entries.forEach((specifier, index) => {
    probes[`e${index}`] = specifier;
    fs.writeFileSync(path.join(src, `e${index}.js`), `export * from ${JSON.stringify(specifier)};\n`);
  });
  for (const [name, code] of Object.entries(NEGATIVE)) {
    probes[`negative-${name}`] = `negative control: ${name}`;
    fs.writeFileSync(path.join(src, `negative-${name}.js`), `${code}\nexport {};\n`);
  }
  esbuild.buildSync({
    entryPoints: Object.keys({ preload: 1, ...probes }).map((name) => path.join(src, `${name}.js`)),
    outdir: path.join(dir, "out"),
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    absWorkingDir: dir,
    logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  fs.writeFileSync(path.join(dir, "harness.js"), HARNESS);

  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Import probe</title><script type="module" src="/harness.js"></script></head><body><p>Probe</p></body></html>`;
  server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost").pathname;
    const headers = { "content-security-policy": CSP };
    if (url === "/") return response.writeHead(200, { ...headers, "content-type": "text/html" }).end(page);
    if (url === "/harness.js") return response.writeHead(200, { ...headers, "content-type": "text/javascript" }).end(HARNESS);
    const file = path.join(dir, url);
    if (url.startsWith("/out/") && file.startsWith(path.join(dir, "out")) && fs.existsSync(file)) {
      return response.writeHead(200, { ...headers, "content-type": "text/javascript" }).end(fs.readFileSync(file));
    }
    response.writeHead(204, headers).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const runProbe = async (probe) => {
    const context = await browser.newContext();
    const tab = await context.newPage();
    const reported = tab.waitForEvent("console", { predicate: (message) => message.text().startsWith("SCNX_IMPORT_RESULT "), timeout: 30_000 });
    await tab.goto(`${origin}/?probe=${probe}`);
    const result = JSON.parse((await reported).text().slice("SCNX_IMPORT_RESULT ".length));
    await context.close();
    const caught = Object.entries(result.findings).filter(([, list]) => list.length > 0);
    return { ...result, caught: Object.fromEntries(caught) };
  };

  for (const [probe, specifier] of Object.entries(probes)) {
    const result = await runProbe(probe);
    if (probe.startsWith("negative-")) {
      const caught = Object.keys(result.caught).length > 0;
      report.negativeControls.push({ control: probe.slice("negative-".length), caught, findings: result.caught });
      if (!caught) {
        failed = true;
        console.error(`${probe}: the gate did not detect this side effect`);
      }
      continue;
    }
    const clean = !result.error && Object.keys(result.caught).length === 0;
    report.entries.push({ specifier, result: clean ? "pass" : "fail", ...(clean ? {} : { error: result.error, findings: result.caught }) });
    if (!clean) {
      failed = true;
      console.error(`${specifier}: ${result.error ?? JSON.stringify(result.caught)}`);
    }
  }
  report.result = failed ? "fail" : "pass";
  if (!failed) {
    console.log(
      `Import side-effect gate passed under "${CSP}": ${report.entries.length} entries import with no DOM, global, prototype, storage, network, timer, listener, custom-element, stylesheet, or CSP effect; ${report.negativeControls.length} negative controls caught`,
    );
  }
} catch (error) {
  failed = true;
  report.result = "fail";
  report.error = `${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
  console.error(`Import side-effect gate: FAILED\n${report.error}`);
} finally {
  await browser.close();
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "imports-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failed) process.exit(1);
