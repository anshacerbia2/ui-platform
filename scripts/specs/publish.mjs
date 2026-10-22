#!/usr/bin/env node
// Publishes the component specifications of the package in the working
// directory (TDD primitives P24): each `./specs/<name>.json` export, the
// schemas they name, and the `./specs` index. Run by each package's build.
//
//   node ../../scripts/specs/publish.mjs --out dist

import fs from "node:fs";
import path from "node:path";
import { packageEntries } from "../package-entries.mjs";

const out = path.resolve(process.argv[process.argv.indexOf("--out") + 1] ?? "dist");
const packageDir = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
const assets = packageEntries(packageDir).filter((e) => e.out.startsWith("dist/specs/"));
const index = { schemaVersion: 1, package: manifest.name, specs: [] };
for (const asset of assets) {
  const target = path.join(out, asset.out.slice("dist/".length));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (asset.subpath.startsWith("./specs/schema/")) {
    fs.copyFileSync(path.join(packageDir, asset.source), target);
  } else if (asset.subpath !== "./specs") {
    const spec = JSON.parse(fs.readFileSync(path.join(packageDir, asset.source), "utf8"));
    // The source names its schema by a repository path; the published file names the packaged one.
    const published = { ...spec, $schema: `./schema/${spec.kind}.schema.json` };
    fs.writeFileSync(target, `${JSON.stringify(published, null, 2)}\n`);
    index.specs.push({ entry: spec.entry, kind: spec.kind, path: asset.subpath });
  }
}
index.specs.sort((a, b) => a.entry.localeCompare(b.entry));
fs.writeFileSync(path.join(out, "specs/index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(`${manifest.name}: ${index.specs.length} specifications published to ${path.relative(packageDir, out)}/specs`);
