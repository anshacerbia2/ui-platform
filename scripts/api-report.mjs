#!/usr/bin/env node
// TDD packaging RC1: the public-API report of each packed package
// (STD-UIP-ENG-001 section 3.5 item 1). Installs the tarballs into a fresh
// project outside the workspace, then writes, under packages/<dir>/api/:
// - one API Extractor report per public JavaScript entry (`<entry>.api.md`),
//   from the declarations the tarball publishes; API Extractor's released
//   configuration takes one `mainEntryPointFilePath`, so it runs once per entry
//   over one shared compiler state;
// - `css-contract.json`: for every published stylesheet its cascade layers,
//   `scnx-` classes, `data-` attributes, and declared custom properties;
//   for every token JSON the name, CSS name, type, and lifecycle of each token
//   (values may change in a minor release); and the public Sass members.
// With --check it writes nothing and fails when a report differs from the
// committed one, so every public-API change is reviewed in its pull request.
//
//   node scripts/api-report.mjs --packs <dir from inspect-packages.mjs> [--check]

import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { CompilerState, Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { packageDirOf } from "./package-entries.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const check = process.argv.includes("--check");

/** Report file name of an export subpath: `.` -> `index`, `./components/a` -> `components.a`. */
export const reportName = (subpath) => (subpath === "." ? "index" : subpath.slice(2).replaceAll("/", "."));

/** The CSS contract of one stylesheet's text. */
export function stylesheetContract(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const unique = (pattern, group = 0) => [...new Set([...text.matchAll(pattern)].map((m) => m[group]))].sort();
  const layers = new Set();
  for (const [, list] of text.matchAll(/@layer\s+([^;{]+)[;{]/g)) for (const name of list.split(",")) layers.add(name.trim());
  return {
    layers: [...layers].sort(),
    classes: unique(/\.(scnx-[A-Za-z0-9_-]+)/g, 1),
    dataAttributes: unique(/\[(data-[a-z0-9-]+)/g, 1),
    customProperties: unique(/(?:^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/gm, 1),
  };
}

/** Public Sass members (variables, mixins, functions not starting with `_` or `-`). */
export function sassContract(texts) {
  const members = new Set();
  for (const text of texts) {
    for (const [, name] of text.matchAll(/^\$([A-Za-z][\w-]*)\s*:/gm)) members.add(`$${name}`);
    for (const [, kind, name] of text.matchAll(/@(mixin|function)\s+([A-Za-z][\w-]*)/g)) members.add(`@${kind} ${name}`);
  }
  return [...members].sort();
}

function selfTest() {
  const css = `/* x */ @layer reset, tokens;\n@layer tokens { :where([data-scnx-theme="a"]) { --ds-a: 1; --ds-b: var(--ds-a); } }\n.scnx-btn[data-variant] { color: red; }`;
  const contract = stylesheetContract(css);
  const failures = [];
  if (contract.layers.join() !== "reset,tokens") failures.push(`layers ${contract.layers}`);
  if (contract.classes.join() !== "scnx-btn") failures.push(`classes ${contract.classes}`);
  if (contract.dataAttributes.join() !== "data-scnx-theme,data-variant") failures.push(`data attributes ${contract.dataAttributes}`);
  if (contract.customProperties.join() !== "--ds-a,--ds-b") failures.push(`custom properties ${contract.customProperties}`);
  const sass = sassContract(["$ds-a: 1;\n$_private: 2;\n@mixin theme($x) {}\n@function -hidden() {}\n@function scale($n) {}"]);
  if (sass.join() !== "$ds-a,@function scale,@mixin theme") failures.push(`sass ${sass}`);
  if (reportName(".") !== "index" || reportName("./components/accordion-base") !== "components.accordion-base") failures.push("reportName");
  if (failures.length > 0) {
    console.error(`API report self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("API report self-test passed: 6 checks");
}

function main() {
  const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
  // A consumer project: the tarballs plus the types their declarations import.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-api-report-"));
  const workspaceRequire = createRequire(path.resolve("packages/core-ui/package.json"));
  const versionOf = (name) => workspaceRequire(`${name}/package.json`).version;
  const dependencies = {};
  for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
  const react = packReport.packages[0].peerDependencies.react.replace(/^\^/, "");
  Object.assign(dependencies, { react, "react-dom": react, "@types/react": versionOf("@types/react"), "@types/react-dom": versionOf("@types/react-dom") });
  fs.writeFileSync(path.join(dir, "package.json"), `${JSON.stringify({ name: "scnx-api-report", private: true, type: "module", dependencies }, null, 2)}\n`);
  const failures = [];
  try {
    execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
    for (const pkg of packReport.packages) failures.push(...reportPackage(dir, pkg));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    console.error(check ? "Public-API reports differ from the committed ones; run node scripts/api-report.mjs --packs <dir> and review the change." : "API report generation failed.");
    process.exit(1);
  }
}

function reportPackage(consumerDir, pkg) {
  const failures = [];
  const installed = path.join(consumerDir, "node_modules", ...pkg.name.split("/"));
  const manifest = JSON.parse(fs.readFileSync(path.join(installed, "package.json"), "utf8"));
  const reportFolder = path.resolve(packageDirOf(pkg.name), "api");
  const tempFolder = fs.mkdtempSync(path.join(consumerDir, "api-temp-"));
  fs.mkdirSync(reportFolder, { recursive: true });
  const expected = new Set();

  const entries = Object.entries(manifest.exports).filter(([, target]) => typeof target === "object");
  const declarations = entries.map(([, target]) => path.join(installed, target.types));
  let compilerState;
  for (const [subpath, target] of entries) {
    const name = reportName(subpath);
    expected.add(`${name}.api.md`);
    const config = ExtractorConfig.prepare({
      configObject: {
        projectFolder: installed,
        mainEntryPointFilePath: path.join(installed, target.types),
        compiler: {
          overrideTsconfig: {
            compilerOptions: { strict: true, module: "esnext", moduleResolution: "bundler", target: "es2022", jsx: "react-jsx", types: [], skipLibCheck: true },
          },
        },
        apiReport: { enabled: true, reportFolder, reportTempFolder: tempFolder, reportFileName: name },
        docModel: { enabled: false },
        dtsRollup: { enabled: false },
        tsdocMetadata: { enabled: false },
        newlineKind: "lf",
        messages: {
          compilerMessageReporting: { default: { logLevel: "error" } },
          extractorMessageReporting: { default: { logLevel: "none", addToApiReportFile: false } },
          tsdocMessageReporting: { default: { logLevel: "none", addToApiReportFile: false } },
        },
      },
      configObjectFullPath: undefined,
      packageJsonFullPath: path.join(installed, "package.json"),
    });
    compilerState ??= CompilerState.create(config, { additionalEntryPoints: declarations });
    const result = Extractor.invoke(config, { localBuild: !check, compilerState, messageCallback: (message) => { message.handled = message.logLevel !== "error"; } });
    if (!result.succeeded && !(check && result.apiReportChanged)) failures.push(`${pkg.name}${subpath.slice(1)}: API Extractor failed (${result.errorCount} errors)`);
    if (check && result.apiReportChanged) failures.push(`${pkg.name}${subpath.slice(1)}: public API differs from api/${name}.api.md`);
  }

  // CSS contract.
  const contract = { stylesheets: {}, tokens: {}, sass: {} };
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (typeof target !== "string") continue;
    const file = path.join(installed, target);
    if (file.endsWith(".css")) contract.stylesheets[subpath] = stylesheetContract(fs.readFileSync(file, "utf8"));
    else if (/\/tokens\/json\/[^/]+\.json$/.test(target)) {
      contract.tokens[subpath] = JSON.parse(fs.readFileSync(file, "utf8")).tokens.map(({ name, cssName, type, lifecycle }) => ({ name, cssName, type, lifecycle }));
    } else if (file.endsWith(".scss")) {
      const folder = path.dirname(file);
      const texts = fs.readdirSync(folder).filter((f) => f.endsWith(".scss")).sort().map((f) => fs.readFileSync(path.join(folder, f), "utf8"));
      contract.sass[subpath] = sassContract(texts);
    }
  }
  const hasCss = Object.keys(contract.stylesheets).length + Object.keys(contract.tokens).length + Object.keys(contract.sass).length > 0;
  if (hasCss) {
    expected.add("css-contract.json");
    const text = `${JSON.stringify(contract, null, 2)}\n`;
    const committed = path.join(reportFolder, "css-contract.json");
    if (check) {
      if (!fs.existsSync(committed) || fs.readFileSync(committed, "utf8") !== text) failures.push(`${pkg.name}: CSS contract differs from api/css-contract.json`);
    } else fs.writeFileSync(committed, text);
  }

  // No stale report survives an entry's removal.
  for (const file of fs.readdirSync(reportFolder)) {
    if (expected.has(file)) continue;
    if (check) failures.push(`${pkg.name}: api/${file} has no public entry`);
    else fs.rmSync(path.join(reportFolder, file));
  }
  if (!check) console.log(`${pkg.name}: ${entries.length} API reports${hasCss ? " and css-contract.json" : ""} written to ${path.relative(process.cwd(), reportFolder)}`);
  else if (failures.length === 0) console.log(`${pkg.name}: ${entries.length} API reports${hasCss ? " and the CSS contract" : ""} match`);
  return failures;
}

if (process.argv.includes("--self-test")) selfTest();
else main();
