#!/usr/bin/env node
// PLAN P0 row 10c license gate (TDD packaging V4). Fails unless:
// - every package in the workspace lockfile declares a license expression
//   whose identifiers are on the SPDX license list (or `LicenseRef-*`); the
//   license is read from each installed package's own package.json; a
//   lockfile package not installed on this platform (another OS or CPU, or an
//   optional dependency of one) is read from the registry's metadata for that
//   exact version, and a failed lookup fails the gate;
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
import fs from "node:fs";
import path from "node:path";
import { vendoredSchema } from "../sbom/vendored.mjs";

// The SPDX license list as synchronized into the official CycloneDX schema (V5).
const SPDX_IDS = new Set(vendoredSchema("spdx.schema.json").enum);

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

/** A package.json license field as one expression; legacy object and array forms are normalized. */
export function declaredLicense(manifest) {
  const one = (value) => (typeof value === "string" ? value : value?.type);
  if (manifest.license !== undefined) return one(manifest.license);
  if (Array.isArray(manifest.licenses) && manifest.licenses.length > 0) {
    const ids = manifest.licenses.map(one);
    return ids.length === 1 ? ids[0] : `(${ids.join(" OR ")})`;
  }
  return undefined;
}

/**
 * Lockfile packages (`name@version`) and whether each is platform-specific,
 * read from the `packages:` section of pnpm-lock.yaml (lockfile v9).
 */
export function lockfilePackages(text) {
  const section = text.split(/^packages:\n/m)[1]?.split(/^snapshots:\n/m)[0] ?? "";
  const packages = new Map();
  for (const block of section.split(/\n(?=  \S)/)) {
    const key = /^  '?([^':\n]+)'?:/.exec(block)?.[1];
    if (key) packages.set(key, /^    (os|cpu|libc):/m.test(block));
  }
  return packages;
}

/** `name@version` -> license from the registry's per-version metadata; failures are recorded. */
async function registryLicenseMap(keys, failures) {
  const registry = (process.env.npm_config_registry ?? "https://registry.npmjs.org/").replace(/\/?$/, "/");
  const result = new Map();
  const queue = [...keys];
  const worker = async () => {
    for (let key = queue.shift(); key; key = queue.shift()) {
      const at = key.lastIndexOf("@");
      const name = key.slice(0, at);
      const version = key.slice(at + 1);
      try {
        const response = await fetch(`${registry}${name.replace("/", "%2F")}/${version}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        result.set(key, declaredLicense(await response.json()));
      } catch (error) {
        failures.push(`${key}: registry metadata lookup failed (${error.message})`);
      }
    }
  };
  await Promise.all(Array.from({ length: 16 }, worker));
  return result;
}

/** Installed packages under node_modules/.pnpm: `name@version` -> license expression. */
function installedLicenses(root) {
  const store = path.join(root, "node_modules", ".pnpm");
  const found = new Map();
  for (const entry of fs.readdirSync(store)) {
    const modules = path.join(store, entry, "node_modules");
    if (!fs.existsSync(modules)) continue;
    const at = entry.indexOf("@", 1);
    if (at === -1) continue;
    const name = entry.slice(0, at).replace("+", "/");
    const manifestPath = path.join(modules, name, "package.json");
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    found.set(`${manifest.name}@${manifest.version}`, declaredLicense(manifest));
  }
  return found;
}

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
  const lock = "packages:\n\n  '@a/b@1.0.0':\n    resolution: {integrity: x}\n    os: [linux]\n\n  c@2.0.0:\n    resolution: {integrity: y}\n\nsnapshots:\n\n  c@2.0.0: {}\n";
  const parsed = lockfilePackages(lock);
  if (parsed.get("@a/b@1.0.0") !== true || parsed.get("c@2.0.0") !== false || parsed.size !== 2) {
    console.error(`lockfilePackages: ${JSON.stringify([...parsed])}`);
    process.exit(1);
  }
  if (declaredLicense({ licenses: [{ type: "MIT" }, { type: "Apache-2.0" }] }) !== "(MIT OR Apache-2.0)" || declaredLicense({ license: { type: "ISC" } }) !== "ISC") {
    console.error("declaredLicense does not normalize legacy forms");
    process.exit(1);
  }
  const failed = cases.filter(([expression, expected]) => expressionProblems(expression).length !== expected);
  for (const [expression, expected] of failed) console.error(`${JSON.stringify(expression)}: expected ${expected} problems, got ${JSON.stringify(expressionProblems(expression))}`);
  if (failed.length > 0) process.exit(1);
  console.log(`License gate self-test passed: ${cases.length + 2} cases`);
}

async function main() {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index > -1 ? process.argv[index + 1] : fallback;
  };
  const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
  const outDir = path.resolve(arg("--out", "artifacts/security"));
  const failures = [];

  // Workspace lockfile: development and build dependencies included. Licenses
  // come from installed manifests, not from the package manager's store index.
  const locked = lockfilePackages(fs.readFileSync("pnpm-lock.yaml", "utf8"));
  const installed = installedLicenses(process.cwd());
  const fromRegistry = [...locked.keys()].filter((key) => !installed.has(key));
  const registryLicenses = await registryLicenseMap(fromRegistry, failures);
  const byLicense = {};
  let packages = 0;
  for (const key of locked.keys()) {
    const known = installed.has(key) || registryLicenses.has(key);
    if (!known) continue; // the lookup failure is already recorded
    const license = installed.has(key) ? installed.get(key) : registryLicenses.get(key);
    packages++;
    byLicense[license ?? "<none>"] = (byLicense[license ?? "<none>"] ?? 0) + 1;
    for (const problem of expressionProblems(license)) failures.push(`${key}: ${problem}`);
  }
  if (locked.size === 0) failures.push("no packages found in pnpm-lock.yaml");

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

  const report = { schemaVersion: 1, lockfilePackages: packages, fromRegistry: fromRegistry.length, byLicense, shipped, copiedAssets: { component: provenance.component, files: assets }, result: failures.length === 0 ? "pass" : "fail", failures };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "license-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (failures.length > 0) {
    console.error(`License gate: FAILED\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log(
    `License gate passed: all ${packages} lockfile packages declare SPDX licenses (${fromRegistry.length} not installed on this platform, read from registry metadata) (${Object.entries(byLicense).map(([l, n]) => `${l} ${n}`).join(", ")}); ${shipped.length} tarballs declare a license and ship LICENSE; ${assets.length} copied font files match their provenance (${provenance.component.license})`,
  );
}

if (process.argv.includes("--self-test")) selfTest();
else await main();
