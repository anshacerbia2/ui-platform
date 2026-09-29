#!/usr/bin/env node
// Write explicit `exports` into both package manifests from
// scripts/package-entries.mjs. `--check` fails instead of writing when a
// manifest differs from the generated list (PLAN P0 row 3).

import fs from "node:fs";
import path from "node:path";
import { exportsMap, packageDirs } from "./package-entries.mjs";

const check = process.argv.includes("--check");
const stale = [];

for (const dir of packageDirs) {
  const manifestPath = path.resolve(dir, "package.json");
  const text = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(text);
  const exports = exportsMap(path.resolve(dir));
  if (JSON.stringify(manifest.exports) === JSON.stringify(exports)) continue;
  if (check) {
    stale.push(`${dir}/package.json`);
    continue;
  }
  manifest.exports = exports;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Updated exports in ${dir}/package.json (${Object.keys(exports).length} subpaths)`);
}

if (stale.length > 0) {
  console.error(`Exports differ from source entries; run node scripts/sync-exports.mjs:\n${stale.join("\n")}`);
  process.exit(1);
}
if (check) console.log("Exports match source entries");
