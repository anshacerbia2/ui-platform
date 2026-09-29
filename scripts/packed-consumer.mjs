#!/usr/bin/env node
// PLAN P0 row 3 isolated consumer (TDD packaging PKG-005/PKG-006).
// Installs the packed tarballs into fresh projects outside the workspace, each
// with an empty store and strict peers, at the lowest and highest supported
// React versions. Every declared subpath must resolve: JavaScript entries
// import in Node, asset entries resolve to non-empty files, and every entry
// typechecks under `bundler` and `nodenext` resolution with skipLibCheck off.
//
//   node scripts/packed-consumer.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));

// Types and compiler versions match the workspace so the fixture checks the
// packages, not a different TypeScript release.
const workspaceRequire = createRequire(path.resolve("packages/core-ui/package.json"));
const versionOf = (name) => workspaceRequire(`${name}/package.json`).version;
const systemRequire = createRequire(path.resolve("packages/design-system/package.json"));
const devDependencies = {
  typescript: versionOf("typescript"),
  "@types/react": versionOf("@types/react"),
  "@types/react-dom": versionOf("@types/react-dom"),
  // sass does not export its package.json; read it beside the resolved entry.
  sass: JSON.parse(fs.readFileSync(path.join(path.dirname(systemRequire.resolve("sass")), "package.json"), "utf8")).version,
};

const peerRange = packReport.packages.find((pkg) => pkg.name === "@scnx/system").peerDependencies.react;
for (const pkg of packReport.packages) {
  for (const dep of ["react", "react-dom"]) {
    if (pkg.peerDependencies[dep] !== peerRange) {
      throw new Error(`${pkg.name} declares ${dep}@${pkg.peerDependencies[dep]}; expected ${peerRange} in every package`);
    }
  }
}
const lowest = peerRange.replace(/^\^/, "");
const boundaries = [
  { label: "lowest", react: lowest },
  { label: "highest", react: peerRange },
];

const run = (command, cwd) => execSync(command, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function consumerProject(boundary) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `scnx-consumer-${boundary.label}-`));
  const dependencies = { react: boundary.react, "react-dom": boundary.react };
  for (const pkg of packReport.packages) {
    dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
  }
  writeJson(path.join(dir, "package.json"), {
    name: `scnx-packed-consumer-${boundary.label}`,
    private: true,
    type: "module",
    dependencies,
    devDependencies,
  });
  return dir;
}

function importScript(entries) {
  return `import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const results = [];
for (const specifier of ${JSON.stringify(entries.javascript)}) {
  const mod = await import(specifier);
  const names = Object.keys(mod);
  if (names.length === 0) throw new Error(specifier + " exports nothing");
  results.push({ specifier, kind: "javascript", exports: names.length });
}
for (const specifier of ${JSON.stringify(entries.assets)}) {
  const file = fileURLToPath(import.meta.resolve(specifier));
  const bytes = fs.statSync(file).size;
  if (bytes === 0) throw new Error(specifier + " is empty");
  results.push({ specifier, kind: "asset", bytes });
}
const { Button } = await import("@scnx/system/components/button");
const html = renderToString(createElement(Button, null, "Save"));
if (!html.includes("scnx-btn")) throw new Error("SSR render of Button lost its class: " + html);
console.log(JSON.stringify(results));
`;
}

// Token outputs from the consumer's side: every theme stylesheet has one
// scoped root per mode declaring exactly the JSON token set, and the Sass
// contract resolves through the package exports with Sass's pkg: importer.
function tokensScript(specifiers) {
  return `import fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const specifiers = ${JSON.stringify(specifiers)};
const themes = specifiers
  .map((s) => /tokens\\/json\\/([a-z0-9-]+)\\.json$/.exec(s)?.[1])
  .filter(Boolean);
if (themes.length === 0) throw new Error("no token JSON subpath is exported");
let declarations = 0;
for (const theme of themes) {
  const json = JSON.parse(fs.readFileSync(fileURLToPath(import.meta.resolve("@scnx/system/tokens/json/" + theme + ".json")), "utf8"));
  const css = fs.readFileSync(fileURLToPath(import.meta.resolve("@scnx/system/tokens/css/" + theme + ".css")), "utf8");
  for (const mode of json.modes) {
    const selector = '[data-scnx-theme="' + theme + '"][data-scnx-resolved-mode="' + mode + '"]';
    const start = css.indexOf(selector + " {");
    if (start === -1) throw new Error(theme + ": no root for mode " + mode);
    const block = css.slice(start, css.indexOf("}", start));
    const names = [...block.matchAll(/(--ds-[\\w-]+):/g)].map((m) => m[1]).sort();
    const expected = json.tokens.map((t) => t.cssName).sort();
    if (names.join() !== expected.join()) throw new Error(theme + "/" + mode + ": CSS and JSON token sets differ");
    declarations += names.length;
  }
}
const scss = sass.compileString(
  '@use "pkg:@scnx/system/tokens/scss" as ds;\\n.probe { box-shadow: ds.$effect-shadow-low; color: ds.token("color-primary-surface-solid-default"); }',
  { importers: [new sass.NodePackageImporter()] },
).css;
if (!scss.includes("var(--ds-effect-shadow-low)") || !scss.includes("var(--ds-color-primary-surface-solid-default)")) {
  throw new Error("Sass contract did not resolve to custom properties: " + scss);
}
console.log(JSON.stringify({ themes: themes.length, declarations }));
`;
}

function typesSource(specifiers) {
  const lines = specifiers.map((specifier, index) => `import * as m${index} from "${specifier}";`);
  lines.push(`export const entries = [${specifiers.map((_, index) => `m${index}`).join(", ")}];`);
  return `${lines.join("\n")}\n`;
}

const tsconfig = (moduleResolution) => ({
  compilerOptions: {
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    jsx: "react-jsx",
    target: "es2022",
    module: moduleResolution === "bundler" ? "esnext" : "nodenext",
    moduleResolution,
    types: [],
  },
  files: ["types.ts"],
});

const entries = { javascript: [], assets: [] };
for (const pkg of packReport.packages) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packsDir, pkg.tarball.replace(/\.tgz$/, ""), "package", "package.json"), "utf8"),
  );
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (subpath === "./package.json") continue;
    const specifier = `${pkg.name}${subpath.slice(1)}`;
    if (typeof target === "object") entries.javascript.push(specifier);
    else entries.assets.push(specifier);
  }
}

const report = {
  schemaVersion: 1,
  packages: packReport.packages.map(({ name, version, tarballSha256 }) => ({ name, version, tarballSha256 })),
  peerRange,
  scenarios: [],
};
let failed = false;

for (const boundary of boundaries) {
  const dir = consumerProject(boundary);
  const scenario = { scenario: `packed-consumer-${boundary.label}`, requested: boundary.react, versions: {}, checks: [] };
  report.scenarios.push(scenario);
  try {
    run(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, dir);
    const consumerRequire = createRequire(path.join(dir, "package.json"));
    for (const name of ["react", "react-dom", "typescript", ...packReport.packages.map((pkg) => pkg.name)]) {
      scenario.versions[name] = consumerRequire(`${name}/package.json`).version;
    }

    fs.writeFileSync(path.join(dir, "imports.mjs"), importScript(entries));
    const imported = JSON.parse(run("node imports.mjs", dir).trim());
    scenario.checks.push({ check: "import-and-resolve", result: "pass", entries: imported.length });
    scenario.checks.push({ check: "ssr-render", result: "pass" });

    const tokenSubpaths = entries.assets.filter((specifier) => specifier.startsWith("@scnx/system/tokens/"));
    if (tokenSubpaths.length > 0) {
      fs.writeFileSync(path.join(dir, "tokens.mjs"), tokensScript(tokenSubpaths));
      const tokens = JSON.parse(run("node tokens.mjs", dir).trim());
      scenario.checks.push({ check: "tokens", result: "pass", ...tokens });
    }

    fs.writeFileSync(path.join(dir, "types.ts"), typesSource(entries.javascript));
    for (const resolution of ["bundler", "nodenext"]) {
      writeJson(path.join(dir, `tsconfig.${resolution}.json`), tsconfig(resolution));
      run(`node node_modules/typescript/bin/tsc -p tsconfig.${resolution}.json`, dir);
      scenario.checks.push({ check: `types-${resolution}`, result: "pass", entries: entries.javascript.length });
    }
    scenario.result = "pass";
    console.log(
      `${scenario.scenario}: react ${scenario.versions.react}, ${imported.length} entries resolve, types pass (bundler, nodenext)`,
    );
  } catch (error) {
    failed = true;
    scenario.result = "fail";
    scenario.error = `${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
    console.error(`${scenario.scenario}: FAILED\n${scenario.error}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

fs.mkdirSync(outDir, { recursive: true });
writeJson(path.join(outDir, "consumer-report.json"), report);
if (failed) process.exit(1);
console.log(`Packed consumer passed at both React boundaries; report: ${path.join(outDir, "consumer-report.json")}`);
