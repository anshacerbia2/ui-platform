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
 * @typedef {{ subpath: string, kind: "javascript" | "css", source: string, out: string }} Entry
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
    // The barrel imports every component stylesheet; the build moves the
    // aggregate CSS it produces to this path.
    entries.push({ subpath: "./styles/components.css", kind: "css", source: barrel, out: "dist/styles/components.css" });
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
  return spec
    .entries(packageDir)
    .map((entry) => ({ ...entry, source: path.relative(packageDir, entry.source).replaceAll("\\", "/") }));
}

/** tsup `entry` map (output name without `dist/` -> source) for JavaScript entries. */
export function tsupEntries(packageDir) {
  return Object.fromEntries(
    packageEntries(packageDir)
      .filter((entry) => entry.kind === "javascript")
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
