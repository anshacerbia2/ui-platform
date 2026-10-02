// Single source of the public entries of both packages. The tsup configs build
// exactly these entries and scripts/sync-exports.mjs writes them as explicit
// package `exports` (TDD packaging: explicit, generated lists, never `./*`).

import fs from "node:fs";
import path from "node:path";

const INDEX_FILES = ["index.ts", "index.tsx"];

function findIndex(dir) {
  return INDEX_FILES.map((file) => path.join(dir, file)).find((file) => fs.existsSync(file));
}

function directories(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * The directive a module starts with, ignoring leading comments and blank
 * lines: "client-only" for "use client" (TDD packaging K1), else "server-safe".
 * @param {string} text
 * @returns {"client-only" | "server-safe"}
 */
export function entryEnvironment(text) {
  const body = text.replace(/^(?:\s+|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "");
  return /^["']use client["']/.test(body) ? "client-only" : "server-safe";
}

/**
 * @typedef {{ subpath: string, kind: "javascript" | "css" | "asset", source: string, out: string, environment?: "client-only" | "server-safe" }} Entry
 * `out` is the published file relative to the package root, without extension
 * for JavaScript entries (`.js` and `.d.ts` are both emitted).
 */

/** @returns {Entry[]} */
function coreUiEntries(packageDir) {
  const entries = [];
  for (const family of ["components", "hooks", "providers"]) {
    const familyDir = path.join(packageDir, "src", family);
    for (const name of directories(familyDir)) {
      const source = findIndex(path.join(familyDir, name));
      if (!source) continue;
      entries.push({
        subpath: `./${family}/${name}`,
        kind: "javascript",
        source,
        out: `dist/${family}/${name}/index`,
      });
    }
  }
  return entries;
}

/** @returns {Entry[]} */
function systemEntries(packageDir) {
  const componentsDir = path.join(packageDir, "src", "components");
  const entries = [];
  const seen = new Map();
  for (const category of ["atoms", "molecules", "organisms", "layouts"]) {
    for (const name of directories(path.join(componentsDir, category))) {
      const source = findIndex(path.join(componentsDir, category, name));
      if (!source) continue;
      if (seen.has(name)) {
        throw new Error(`Component name "${name}" exists in both ${seen.get(name)} and ${category}`);
      }
      seen.set(name, category);
      entries.push({
        subpath: `./components/${name}`,
        kind: "javascript",
        source,
        out: `dist/components/${name}/index`,
      });
    }
  }
  entries.sort((a, b) => a.subpath.localeCompare(b.subpath));
  const barrel = findIndex(componentsDir);
  if (barrel) {
    entries.unshift({ subpath: "./components", kind: "javascript", source: barrel, out: "dist/components/index" });
  }
  // One aggregate component stylesheet, assembled from this Sass bundle and
  // the frozen Panda recipes by scripts/styles/assemble.mjs.
  const bundle = path.join(packageDir, "src/styles/bundles/components.scss");
  if (fs.existsSync(bundle)) {
    entries.push({ subpath: "./styles/components.css", kind: "css", source: bundle, out: "dist/styles/components.css" });
  }

  // Token outputs and fonts written by scripts/tokens/emit.mjs, declared by
  // tokens.config.json (TDD tokens, API / Interface; TDD packaging fonts/<asset>).
  const configFile = path.join(packageDir, "tokens.config.json");
  if (fs.existsSync(configFile)) {
    const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
    for (const themeId of Object.keys(config.themes).sort()) {
      entries.push({ subpath: `./tokens/css/${themeId}.css`, kind: "asset", source: configFile, out: `dist/tokens/css/${themeId}.css` });
      entries.push({ subpath: `./tokens/json/${themeId}.json`, kind: "asset", source: configFile, out: `dist/tokens/json/${themeId}.json` });
    }
    entries.push({ subpath: "./tokens/scss", kind: "asset", source: configFile, out: "dist/tokens/scss/_index.scss" });
    const fonts = Object.values(config.fonts.assets).flatMap((asset) => [...asset.faces, asset.license]);
    for (const file of fonts.map((f) => f.publish).sort()) {
      entries.push({ subpath: `./${file}`, kind: "asset", source: configFile, out: `dist/${file}` });
    }
  }
  return entries;
}

const PACKAGES = {
  "@scnx/core-ui": { dir: "packages/core-ui", entries: coreUiEntries },
  "@scnx/system": { dir: "packages/design-system", entries: systemEntries },
};

/** Entries for the package in `packageDir` (absolute), with sources relative to it. */
export function packageEntries(packageDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
  const spec = PACKAGES[manifest.name];
  if (!spec) throw new Error(`No entry specification for ${manifest.name}`);
  return spec.entries(packageDir).map((entry) => ({
    ...entry,
    source: path.relative(packageDir, entry.source).replaceAll("\\", "/"),
    ...(entry.kind === "javascript" ? { environment: entryEnvironment(fs.readFileSync(entry.source, "utf8")) } : {}),
  }));
}

/**
 * tsup `entry` map (output name without `dist/` -> source) for the JavaScript
 * entries of one environment, or all of them (TDD packaging K2).
 * @param {string} packageDir
 * @param {"client-only" | "server-safe"} [environment]
 */
export function tsupEntries(packageDir, environment) {
  return Object.fromEntries(
    packageEntries(packageDir)
      .filter((entry) => entry.kind === "javascript" && (!environment || entry.environment === environment))
      .map((entry) => [entry.out.slice("dist/".length), entry.source]),
  );
}

/** Explicit `exports` object for the package manifest. */
export function exportsMap(packageDir) {
  const exports = {};
  for (const entry of packageEntries(packageDir)) {
    exports[entry.subpath] =
      entry.kind === "javascript"
        ? { types: `./${entry.out}.d.ts`, default: `./${entry.out}.js` }
        : `./${entry.out}`;
  }
  exports["./package.json"] = "./package.json";
  return exports;
}

export const packageDirs = Object.values(PACKAGES).map((spec) => spec.dir);
