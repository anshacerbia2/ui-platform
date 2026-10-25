#!/usr/bin/env node
// PLAN P3 payload and runtime evidence (STD-UIP-ENG-001 section 3.3; TDD
// packaging PF1-PF6). Installs the packed tarballs into a fresh project and
// measures what a consumer pays, with the workspace's esbuild as the consumer
// bundler and React and React DOM excluded (peers the consumer already has):
// - every public JavaScript entry as a whole (`export *`, no tree shaking);
// - named import scenarios: one per reference-slice component, a layout, and
//   a representative page, each rendered inside a ThemeProvider;
// - the published stylesheets and fonts;
// each as raw, minified (parsed), gzip level 9, and Brotli quality 11 bytes.
// Each scenario is then imported and rendered in a fresh page of every engine
// in support-matrix.json, several rounds in turn, and the report keeps every
// sample with its median. Nothing here is a budget: the job fails only when a
// measurement is missing (STD-UIP-ENG-001 "Fail closed"), never on a value.
//
//   node scripts/performance.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>] [--runs <n>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { browserEngines } from "./browser-engines.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const RUNS = Number(arg("--runs", "9"));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

const require = createRequire(path.resolve("package.json"));
const esbuild = require("esbuild");

const PEERS = ["react", "react-dom", "react/*", "react-dom/*"];
const GZIP_LEVEL = zlib.constants.Z_BEST_COMPRESSION;
const BROTLI_QUALITY = zlib.constants.BROTLI_MAX_QUALITY;

/** Raw, minified, gzip, and Brotli bytes; `minified` is the parsed size. */
const sizes = (raw, minified) => ({
  raw: Buffer.byteLength(raw),
  minified: Buffer.byteLength(minified),
  gzip: zlib.gzipSync(minified, { level: GZIP_LEVEL }).length,
  brotli: zlib.brotliCompressSync(minified, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY } }).length,
});

// Scenario apps. Each exports mount(element), which renders synchronously.
const PROVIDER = `import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";`;
const wrap = (body) => `<ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>${body}</ThemeProvider>`;
const SCENARIOS = {
  button: {
    title: "Single component: Button",
    imports: [`import { Button } from "@scnx/system/components/button";`],
    jsx: `<Button variant="primary">Save</Button>`,
  },
  "text-field": {
    title: "Single component: TextField",
    imports: [`import { TextField } from "@scnx/system/components/text-field";`],
    jsx: `<TextField label="Email" description="Work address" />`,
  },
  dialog: {
    title: "Single component: Dialog (closed, with its opener)",
    imports: [`import { Button } from "@scnx/system/components/button";`, `import { Dialog } from "@scnx/system/components/dialog";`],
    jsx: `<><Button variant="secondary">Delete run</Button><Dialog open={false} onOpenChange={() => {}}><Dialog.Title>Delete the payroll run?</Dialog.Title><Dialog.Description>This cannot be undone.</Dialog.Description><Dialog.Close>Cancel</Dialog.Close></Dialog></>`,
  },
  tabs: {
    title: "Single component: Tabs",
    imports: [`import { Tabs } from "@scnx/system/components/tabs";`],
    jsx: `<Tabs defaultValue="a"><Tabs.List aria-label="Sections"><Tabs.Tab value="a">Overview</Tabs.Tab><Tabs.Tab value="b">History</Tabs.Tab></Tabs.List><Tabs.Panel value="a">Overview</Tabs.Panel><Tabs.Panel value="b">History</Tabs.Panel></Tabs>`,
  },
  layout: {
    title: "Layout: EdgeLayout with Navbar and Sidebar",
    imports: [`import { EdgeLayout } from "@scnx/system/components/edge-layout";`, `import { Sidebar, SidebarProvider } from "@scnx/system/components/sidebar";`],
    jsx: `<SidebarProvider activePath="#people"><EdgeLayout><EdgeLayout.Navbar><EdgeLayout.Navbar.Start><strong>Scnehaux</strong></EdgeLayout.Navbar.Start></EdgeLayout.Navbar><EdgeLayout.Sidebar><Sidebar><Sidebar.Nav aria-label="Main"><Sidebar.Nav.Group><Sidebar.Nav.Item href="#dashboard" label="Dashboard" /><Sidebar.Nav.Item href="#people" label="People" /><Sidebar.Nav.Item href="#payroll" label="Payroll" /></Sidebar.Nav.Group></Sidebar.Nav></Sidebar></EdgeLayout.Sidebar><EdgeLayout.Content>{content}</EdgeLayout.Content></EdgeLayout></SidebarProvider>`,
    content: `<p>Content</p>`,
  },
};
// The representative page: the layout holding every slice component.
SCENARIOS.page = {
  title: "Representative page: layout, Heading, Text, Tabs, TextField, Dialog, Button",
  imports: [
    ...new Set([...Object.values(SCENARIOS).flatMap((s) => s.imports), `import { Heading } from "@scnx/system/components/heading";`, `import { Text } from "@scnx/system/components/text";`]),
  ],
  jsx: SCENARIOS.layout.jsx.replace(
    "{content}",
    `<Heading as="h1" size="large">People</Heading><Text>Everyone on the payroll.</Text>${SCENARIOS.tabs.jsx}${SCENARIOS["text-field"].jsx}${SCENARIOS.dialog.jsx}`,
  ),
};
SCENARIOS.layout.jsx = SCENARIOS.layout.jsx.replace("{content}", SCENARIOS.layout.content);

const scenarioSource = ({ imports, jsx }) =>
  `import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
${PROVIDER}
${imports.join("\n")}

export function mount(element) {
  const root = createRoot(element);
  flushSync(() => root.render(${wrap(jsx)}));
}
`;

// The page imports React first, then times the scenario's import (fetch,
// parse, compile, evaluate) and its first synchronous render.
const HARNESS = `const scenario = new URL(location.href).searchParams.get("scenario");
await import("/out/preload.js");
let result;
try {
  const start = performance.now();
  const module = await import("/out/" + scenario + ".js");
  const imported = performance.now();
  module.mount(document.getElementById("root"));
  const rendered = performance.now();
  result = { scenario, evaluateMs: imported - start, renderMs: rendered - imported, crossOriginIsolated: self.crossOriginIsolated };
} catch (error) {
  result = { scenario, error: String(error) };
}
console.log("SCNX_PERF_RESULT " + JSON.stringify(result));
`;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const round = (value) => Math.round(value * 100) / 100;

const report = {
  schemaVersion: 1,
  purpose: "Comparative evidence only; no approved budget exists (PLAN 'consumer budget'; STD-UIP-ENG-001 3.3)",
  method: {
    bundler: `esbuild ${esbuild.version}, format esm, platform browser, process.env.NODE_ENV "production"`,
    excluded: PEERS,
    compression: { gzip: `zlib level ${GZIP_LEVEL}`, brotli: `quality ${BROTLI_QUALITY}` },
    parsedSize: "the minified bytes",
    runs: RUNS,
    timing: "performance.now() around import() of the scenario module and its first flushSync render, in a fresh browser context per sample; scenarios alternate within each round",
  },
  runner: {
    os: `${os.type()} ${os.release()} ${os.arch()}`,
    cpu: `${os.cpus().length} x ${os.cpus()[0]?.model ?? "unknown"}`,
    memoryGiB: round(os.totalmem() / 2 ** 30),
    node: process.version,
    image: process.env.ImageOS ? `${process.env.ImageOS} ${process.env.ImageVersion ?? ""}`.trim() : "local",
  },
  install: {},
  packages: [],
  entries: [],
  stylesheets: [],
  fonts: [],
  peers: null,
  scenarios: [],
  engines: [],
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-performance-"));
let failed = false;
let server;
try {
  const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
  for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-performance", private: true, type: "module", dependencies }, null, 2));
  const installStart = performance.now();
  execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  report.install = { ms: Math.round(performance.now() - installStart), note: "cold store; React and React DOM come from the registry, so the network is part of this time" };

  // Packages: published tarball and installed (unpacked) bytes.
  const unpacked = (root) => fs.readdirSync(root, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).reduce((sum, e) => sum + fs.statSync(path.join(e.parentPath, e.name)).size, 0);
  for (const pkg of packReport.packages) {
    const root = path.join(dir, "node_modules", pkg.name);
    report.packages.push({ name: pkg.name, version: pkg.version, tarballBytes: fs.statSync(path.join(packsDir, pkg.tarball)).size, unpackedBytes: unpacked(root) });
  }

  const src = path.join(dir, "src");
  fs.mkdirSync(src);
  const bundle = (file, minify) =>
    esbuild.buildSync({
      entryPoints: [file],
      bundle: true,
      write: false,
      format: "esm",
      platform: "browser",
      external: PEERS,
      minify,
      jsx: "automatic",
      absWorkingDir: dir,
      logLevel: "error",
      define: { "process.env.NODE_ENV": '"production"' },
    }).outputFiles[0].contents;
  const measure = (file) => sizes(bundle(file, false), bundle(file, true));

  // Whole entries.
  for (const pkg of packReport.packages) {
    for (const subpath of Object.keys(pkg.environments)) {
      const specifier = `${pkg.name}${subpath.slice(1)}`;
      const file = path.join(src, `entry-${report.entries.length}.js`);
      fs.writeFileSync(file, `export * from ${JSON.stringify(specifier)};\n`);
      report.entries.push({ specifier, ...measure(file) });
    }
  }

  // React and React DOM, for context: the consumer already pays them.
  const peersFile = path.join(src, "peers.js");
  fs.writeFileSync(peersFile, `export * from "react";\nexport * from "react-dom";\nexport * from "react-dom/client";\n`);
  const peerBytes = (minify) => esbuild.buildSync({ entryPoints: [peersFile], bundle: true, write: false, format: "esm", platform: "browser", minify, absWorkingDir: dir, logLevel: "error", define: { "process.env.NODE_ENV": '"production"' } }).outputFiles[0].contents;
  report.peers = { specifiers: ["react", "react-dom", "react-dom/client"], version: JSON.parse(fs.readFileSync(path.join(dir, "node_modules/react/package.json"), "utf8")).version, ...sizes(peerBytes(false), peerBytes(true)) };

  // Scenarios.
  for (const [name, scenario] of Object.entries(SCENARIOS)) {
    const file = path.join(src, `${name}.jsx`);
    fs.writeFileSync(file, scenarioSource(scenario));
    report.scenarios.push({ scenario: name, title: scenario.title, imports: scenario.imports.map((line) => line.replace(/^import /, "").replace(/;$/, "")), ...measure(file) });
  }

  // Stylesheets and fonts, as published.
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "node_modules/@scnx/system/package.json"), "utf8"));
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (typeof target !== "string") continue;
    const file = path.join(dir, "node_modules/@scnx/system", target);
    if (target.endsWith(".css")) {
      const css = fs.readFileSync(file, "utf8");
      report.stylesheets.push({ specifier: `@scnx/system${subpath.slice(1)}`, ...sizes(css, esbuild.transformSync(css, { loader: "css", minify: true }).code) });
    } else if (target.endsWith(".woff2")) {
      report.fonts.push({ specifier: `@scnx/system${subpath.slice(1)}`, bytes: fs.statSync(file).size });
    }
  }

  // Runtime: one splitting build, so React lands in the chunk preload.js loads.
  fs.writeFileSync(path.join(src, "preload.js"), `import "react";\nimport "react/jsx-runtime";\nimport "react-dom";\nimport "react-dom/client";\n`);
  esbuild.buildSync({
    entryPoints: [path.join(src, "preload.js"), ...Object.keys(SCENARIOS).map((name) => path.join(src, `${name}.jsx`))],
    outdir: path.join(dir, "out"),
    bundle: true,
    splitting: true,
    minify: true,
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    absWorkingDir: dir,
    logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Performance probe</title><script type="module" src="/harness.js"></script></head><body><div id="root"></div></body></html>`;
  // Cross-origin isolation gives performance.now() its finer resolution.
  const headers = { "cross-origin-opener-policy": "same-origin", "cross-origin-embedder-policy": "require-corp", "cache-control": "no-store" };
  server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost").pathname;
    if (url === "/") return response.writeHead(200, { ...headers, "content-type": "text/html" }).end(page);
    if (url === "/harness.js") return response.writeHead(200, { ...headers, "content-type": "text/javascript" }).end(HARNESS);
    const file = path.join(dir, url);
    if (url.startsWith("/out/") && file.startsWith(path.join(dir, "out")) && fs.existsSync(file)) {
      return response.writeHead(200, { ...headers, "content-type": "text/javascript" }).end(fs.readFileSync(file));
    }
    response.writeHead(404, headers).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  for (const engine of browserEngines()) {
    const browser = await engine.type.launch();
    const engineReport = { engine: engine.name, version: browser.version(), scenarios: Object.keys(SCENARIOS).map((scenario) => ({ scenario, evaluateMs: [], renderMs: [] })) };
    report.engines.push(engineReport);
    try {
      for (let run = 0; run < RUNS; run++) {
        for (const samples of engineReport.scenarios) {
          const context = await browser.newContext();
          const tab = await context.newPage();
          const reported = tab.waitForEvent("console", { predicate: (message) => message.text().startsWith("SCNX_PERF_RESULT "), timeout: 30_000 });
          await tab.goto(`${origin}/?scenario=${samples.scenario}`);
          const result = JSON.parse((await reported).text().slice("SCNX_PERF_RESULT ".length));
          await context.close();
          if (result.error) throw new Error(`${engine.name}: ${samples.scenario}: ${result.error}`);
          samples.evaluateMs.push(round(result.evaluateMs));
          samples.renderMs.push(round(result.renderMs));
          samples.crossOriginIsolated = result.crossOriginIsolated;
        }
      }
      for (const samples of engineReport.scenarios) {
        samples.medianEvaluateMs = round(median(samples.evaluateMs));
        samples.medianRenderMs = round(median(samples.renderMs));
      }
    } finally {
      await browser.close();
    }
  }

  const missing = [
    ...report.entries.filter((e) => !(e.minified > 0)).map((e) => e.specifier),
    ...report.scenarios.filter((s) => !(s.minified > 0)).map((s) => s.scenario),
    ...report.engines.flatMap((e) => e.scenarios.filter((s) => s.evaluateMs.length !== RUNS).map((s) => `${e.engine} ${s.scenario}`)),
  ];
  if (report.stylesheets.length === 0) missing.push("stylesheets");
  if (missing.length > 0) throw new Error(`missing measurements: ${missing.join(", ")}`);
  report.result = "pass";
} catch (error) {
  failed = true;
  report.result = "fail";
  report.error = `${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
  console.error(`Performance measurements: FAILED\n${report.error}`);
  // A workflow annotation carries the cause where the job log cannot be read.
  if (process.env.GITHUB_ACTIONS) {
    const escape = (text) => text.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
    console.log(`::error title=Performance measurements::${escape(report.error.slice(0, 4000))}`);
  }
} finally {
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "performance-report.json"), `${JSON.stringify(report, null, 2)}\n`);

if (!failed) {
  const kb = (bytes) => (bytes / 1000).toFixed(1);
  const row = (name, s) => `| ${name} | ${kb(s.raw)} | ${kb(s.minified)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`;
  const header = "| | Raw kB | Minified kB | gzip kB | Brotli kB |\n| :-- | --: | --: | --: | --: |";
  const timing = report.engines.map((e) => `| ${e.engine} ${e.version} | ${e.scenarios.map((s) => `${s.medianEvaluateMs} / ${s.medianRenderMs}`).join(" | ")} |`);
  const summary = [
    "### Payload and runtime (comparative; no approved budget)",
    "",
    `Runner: ${report.runner.cpu}, ${report.runner.memoryGiB} GiB, ${report.runner.image}; ${report.method.bundler}; React and React DOM excluded (${report.peers.version}: ${kb(report.peers.brotli)} kB Brotli).`,
    "",
    header,
    ...report.scenarios.map((s) => row(s.title, s)),
    ...report.stylesheets.map((s) => row(s.specifier, s)),
    "",
    `Median of ${RUNS} samples, import / first render in ms:`,
    "",
    `| Engine | ${Object.keys(SCENARIOS).join(" | ")} |`,
    `| :-- | ${Object.keys(SCENARIOS).map(() => "--:").join(" | ")} |`,
    ...timing,
    "",
  ].join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}
if (failed) process.exit(1);
