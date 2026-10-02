#!/usr/bin/env node
// PLAN P0 row 10c license gate (TDD packaging V4). Fails unless:
// - every package in the workspace lockfile declares a license expression
//   whose identifiers are on the SPDX license list (or `LicenseRef-*`);
// - each packed tarball declares `license` and ships a LICENSE file;
// - every copied asset in the tarball matches its provenance record
//   (packages/design-system/assets/fonts/provenance.json) and ships its
//   license text.
// The report counts packages by license. No allow or deny list is enforced:
// which licenses are acceptable is an open organizational decision.
//
//   node scripts/security/licenses.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]
//   node scripts/security/licenses.mjs --self-test

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// The SPDX license list as synchronized into the official CycloneDX schema (V5).
const SPDX_IDS = new Set(JSON.parse(fs.readFileSync(path.join(here, "../sbom/schema/spdx.schema.json"), "utf8")).enum);

/** Problems with an SPDX license expression (`MIT`, `(MIT OR Apache-2.0)`, `GPL-2.0-only WITH Classpath-exception-2.0`). */
export function expressionProblems(expression) {
  if (typeof expression !== "string" || expression.trim() === "") return ["no license declared"];
  const tokens = expression.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  const problems = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "AND" || token === "OR") continue;
    if (token === "WITH") {
      i++; // the exception identifier follows; exceptions are a separate SPDX list
      continue;
    }
    const id = token.endsWith("+") ? token.slice(0, -1) : token;
    if (!SPDX_IDS.has(id) && !/^LicenseRef-[A-Za-z0-9.-]+$/.test(id)) problems.push(`"${token}" is not an SPDX license identifier`);
  }
  return problems;
}

const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function selfTest() {
  const cases = [
    ["MIT", 0],
    ["(MIT OR Apache-2.0)", 0],
    ["(Apache-2.0 AND BSD-3-Clause)", 0],
    ["GPL-2.0-only WITH Classpath-exception-2.0", 0],
    ["LicenseRef-Proprietary", 0],
    ["", 1],
    [undefined, 1],
    ["Unknown", 1],
    ["MIT OR Banana-1.0", 1],
  ];
  const failed = cases.filter(([expression, expected]) => expressionProblems(expression).length !== expected);
  for (const [expression, expected] of failed) console.error(`${JSON.stringify(expression)}: expected ${expected} problems, got ${JSON.stringify(expressionProblems(expression))}`);
  if (failed.length > 0) process.exit(1);
  console.log(`License gate self-test passed: ${cases.length} cases`);
}

function main() {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index > -1 ? process.argv[index + 1] : fallback;
  };
  const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
  const outDir = path.resolve(arg("--out", "artifacts/security"));
  const failures = [];

  // Workspace lockfile: development and build dependencies included.
  const listed = JSON.parse(execFileSync("pnpm", ["licenses", "list", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  const byLicense = {};
  let packages = 0;
  for (const [license, entries] of Object.entries(listed)) {
    byLicense[license] = entries.length;
    packages += entries.length;
    const problems = expressionProblems(license);
    for (const entry of entries) {
      for (const problem of problems) failures.push(`${entry.name}@${entry.versions.join(",")}: ${problem}`);
    }
  }
  if (packages === 0) failures.push("pnpm licenses list returned no packages");

  // Published tarballs and their copied assets.
  const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
  const shipped = [];
  for (const pkg of packReport.packages) {
    const root = path.join(packsDir, pkg.tarball.replace(/\.tgz$/, ""), "package");
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    if (!manifest.license) failures.push(`${pkg.name}: package.json declares no license`);
    if (!fs.readdirSync(root).some((file) => /^LICENSE(\.md|\.txt)?$/i.test(file))) failures.push(`${pkg.name}: no LICENSE file in the tarball`);
    shipped.push({ name: pkg.name, version: pkg.version, license: manifest.license ?? null });
  }
  const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");
  const systemDir = path.resolve("packages/design-system");
  const provenance = JSON.parse(fs.readFileSync(path.join(systemDir, "assets/fonts/provenance.json"), "utf8"));
  const tokensConfig = JSON.parse(fs.readFileSync(path.join(systemDir, "tokens.config.json"), "utf8"));
  const packedSystem = path.join(packsDir, system.tarball.replace(/\.tgz$/, ""), "package", "dist");
  const assets = [];
  for (const asset of Object.values(tokensConfig.fonts.assets)) {
    for (const face of asset.faces) {
      const expected = provenance.files[path.basename(face.source)];
      const packed = path.join(packedSystem, face.publish);
      if (!expected) failures.push(`${face.source}: no provenance record`);
      else if (!fs.existsSync(packed)) failures.push(`${face.publish}: missing from the tarball`);
      else if (sha256(packed) !== expected) failures.push(`${face.publish}: digest differs from its provenance record`);
      assets.push({ file: face.publish, sha256: expected ?? null, license: provenance.component.license });
    }
    if (!fs.existsSync(path.join(packedSystem, asset.license.publish))) failures.push(`${asset.license.publish}: license text missing from the tarball`);
  }
  failures.push(...expressionProblems(provenance.component.license).map((p) => `${provenance.component.name}: ${p}`));

  const report = { schemaVersion: 1, lockfilePackages: packages, byLicense, shipped, copiedAssets: { component: provenance.component, files: assets }, result: failures.length === 0 ? "pass" : "fail", failures };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "license-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (failures.length > 0) {
    console.error(`License gate: FAILED\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log(
    `License gate passed: ${packages} lockfile packages declare SPDX licenses (${Object.entries(byLicense).map(([l, n]) => `${l} ${n}`).join(", ")}); ${shipped.length} tarballs declare a license and ship LICENSE; ${assets.length} copied font files match their provenance (${provenance.component.license})`,
  );
}

if (process.argv.includes("--self-test")) selfTest();
else main();
