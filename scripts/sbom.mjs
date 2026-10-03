#!/usr/bin/env node
// PLAN P0 row 10c SBOM generator (TDD packaging V5). Writes one CycloneDX 1.7
// JSON SBOM (ECMA-424 2nd edition) per packed tarball and validates it offline
// against the vendored official schema (scripts/sbom/schema, tag 1.7.2).
//
// Each SBOM records the NTIA minimum elements (supplier, component name,
// version, unique identifiers, dependency relationships, SBOM author,
// timestamp) and the CISA 2025 draft additions (component hash, license, tool
// name, generation context as the `build` lifecycle phase):
// - the package is the metadata component, identified by purl and the
//   tarball's SHA-256;
// - every peer dependency is an `isExternal` component with a `versionRange`,
//   because the consumer provides it;
// - every copied asset (the Inter font files) is a component with its
//   provenance record, license, and digest;
// - third-party code compiled into the package (its third-party-code.json,
//   TDD packaging V7) is a library component with its version and license;
// - compositions state that the package's own assembly is complete and that
//   the peers' contents are unknown to this SBOM.
// The timestamp is the source commit's time, so the same commit yields the
// same SBOM.
//
//   node scripts/sbom.mjs --packs <dir from inspect-packages.mjs>
//   node scripts/sbom.mjs --self-test

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { packageDirOf } from "./package-entries.mjs";
import { vendoredSchema } from "./sbom/vendored.mjs";
import { thirdPartyCode } from "./security/third-party-code.mjs";

const SUPPLIER = { name: "UI Platform Team" };
const TOOL = "scnx-sbom (scripts/sbom.mjs)";

/** Validator for CycloneDX 1.7 JSON, built from the vendored schema files. */
export function cycloneDxValidator() {
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: true });
  addFormats(ajv);
  // Formats the schema uses that ajv-formats does not define. Both checks are
  // deliberately permissive (RFC 3987 IRIs and RFC 6531 addresses allow
  // non-ASCII): they reject whitespace and a missing "@", not every invalid value.
  ajv.addFormat("iri-reference", /^\S+$/u);
  ajv.addFormat("idn-email", /^[^\s@]+@[^\s@]+$/u);
  for (const file of ["spdx.schema.json", "jsf-0.82.schema.json", "cryptography-defs.schema.json"]) ajv.addSchema(vendoredSchema(file));
  return ajv.compile(vendoredSchema("bom-1.7.schema.json"));
}

/** npm package URL (purl-spec): `@scope/name` -> `pkg:npm/%40scope/name`. */
export function purl(name, version) {
  return `pkg:npm/${name.replace(/^@/, "%40")}${version ? `@${version}` : ""}`;
}

/** An npm caret or exact range as a purl `vers` range (`^19.0.0` -> `vers:npm/>=19.0.0|<20.0.0`). */
export function versRange(range) {
  const exact = /^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  if (exact) return `vers:npm/${range}`;
  const caret = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  if (!caret) throw new Error(`Unsupported peer range "${range}": only caret and exact ranges are converted`);
  const [major, minor, patch] = caret.slice(1).map(Number);
  const upper = major > 0 ? `${major + 1}.0.0` : minor > 0 ? `0.${minor + 1}.0` : `0.0.${patch + 1}`;
  return `vers:npm/>=${range.slice(1)}|<${upper}`;
}

/** A deterministic RFC 4122 UUID (version 5 layout) from a seed. */
function uuidFrom(seed) {
  const hex = createHash("sha256").update(seed).digest("hex");
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/**
 * The SBOM for one packed package.
 * @param {object} options
 * @param {{ name: string, version: string, license?: string, peerDependencies?: Record<string, string>, peerDependenciesMeta?: Record<string, { optional?: boolean }> }} options.manifest packed package.json
 * @param {string} options.tarballSha256
 * @param {{ component: object, files: { file: string, sha256: string }[] } | null} options.assets copied assets
 * @param {{ sha: string, time: string, repository: string }} options.source
 * @param {{ name: string, version: string, license: string, supplier: string, copyright: string, source: string, sources: string }[]} [options.compiled] third-party code in dist/
 */
export function buildSbom({ manifest, tarballSha256, assets, source, compiled = [] }) {
  const rootRef = purl(manifest.name, manifest.version);
  const peers = Object.entries(manifest.peerDependencies ?? {}).map(([name, range]) => ({
    type: "library",
    "bom-ref": purl(name),
    name,
    purl: purl(name),
    isExternal: true,
    versionRange: versRange(range),
    scope: manifest.peerDependenciesMeta?.[name]?.optional ? "optional" : "required",
  }));
  const files = (assets?.files ?? []).map(({ file, sha256 }) => ({
    type: "file",
    "bom-ref": `${rootRef}#${file}`,
    name: file,
    version: assets.component.version,
    description: `${assets.component.name} (${assets.component.versionDetail})`,
    supplier: { name: assets.component.supplier },
    copyright: assets.component.copyright,
    licenses: [{ license: { id: assets.component.license } }],
    hashes: [{ alg: "SHA-256", content: sha256 }],
    externalReferences: [{ type: "website", url: assets.component.source }],
  }));
  const libraries = compiled.map((c) => ({
    type: "library",
    "bom-ref": purl(c.name, c.version),
    group: c.name.startsWith("@") ? c.name.split("/")[0] : undefined,
    name: c.name.startsWith("@") ? c.name.split("/")[1] : c.name,
    version: c.version,
    purl: purl(c.name, c.version),
    description: `Compiled into dist/ from ${c.sources}`,
    supplier: { name: c.supplier },
    copyright: c.copyright,
    licenses: [{ license: { id: c.license } }],
    externalReferences: [{ type: "vcs", url: c.source }],
  }));
  const included = [...libraries, ...files];
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    serialNumber: `urn:uuid:${uuidFrom(`${rootRef}|${tarballSha256}|${source.sha}`)}`,
    version: 1,
    metadata: {
      timestamp: source.time,
      lifecycles: [{ phase: "build" }],
      tools: { components: [{ type: "application", name: TOOL, version: source.sha }] },
      authors: [SUPPLIER],
      supplier: SUPPLIER,
      component: {
        type: "library",
        "bom-ref": rootRef,
        group: manifest.name.startsWith("@") ? manifest.name.split("/")[0] : undefined,
        name: manifest.name.startsWith("@") ? manifest.name.split("/")[1] : manifest.name,
        version: manifest.version,
        purl: rootRef,
        supplier: SUPPLIER,
        // npm's UNLICENSED is not an SPDX identifier: no permission is granted.
        licenses: manifest.license ? [{ license: { name: manifest.license, acknowledgement: "declared" } }] : undefined,
        hashes: [{ alg: "SHA-256", content: tarballSha256 }],
        externalReferences: [{ type: "vcs", url: source.repository, comment: `source commit ${source.sha}` }],
      },
    },
    components: [...peers, ...included],
    dependencies: [
      { ref: rootRef, dependsOn: [...peers, ...included].map((c) => c["bom-ref"]) },
      ...[...peers, ...included].map((c) => ({ ref: c["bom-ref"], dependsOn: [] })),
    ],
    compositions: [
      { aggregate: "complete", assemblies: [rootRef] },
      ...(peers.length > 0 ? [{ aggregate: "unknown", dependencies: peers.map((c) => c["bom-ref"]) }] : []),
    ],
  };
}

const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

function selfTest() {
  const validate = cycloneDxValidator();
  const source = { sha: "0".repeat(40), time: "2026-10-02T00:00:00Z", repository: "https://github.com/example/repo" };
  const manifest = { name: "@scnx/core-ui", version: "1.0.0", license: "UNLICENSED", peerDependencies: { react: "^19.0.0" } };
  const good = buildSbom({ manifest, tarballSha256: "a".repeat(64), assets: null, source });
  const failures = [];
  if (!validate(good)) failures.push(`a generated SBOM is invalid: ${JSON.stringify(validate.errors?.slice(0, 3))}`);
  const { bomFormat: _omitted, ...missingFormat } = good;
  if (validate(missingFormat)) failures.push("an SBOM without bomFormat validated");
  const badPeer = structuredClone(good);
  badPeer.components[0].version = "19.0.0"; // version and versionRange are exclusive
  if (validate(badPeer)) failures.push("a component with both version and versionRange validated");
  const badHash = structuredClone(good);
  badHash.metadata.component.hashes[0].content = "not-a-digest";
  if (validate(badHash)) failures.push("a malformed SHA-256 validated");
  if (versRange("^19.0.0") !== "vers:npm/>=19.0.0|<20.0.0") failures.push(`versRange("^19.0.0") = ${versRange("^19.0.0")}`);
  if (versRange("^0.3.1") !== "vers:npm/>=0.3.1|<0.4.0") failures.push(`versRange("^0.3.1") = ${versRange("^0.3.1")}`);
  let threw = false;
  try {
    versRange(">=19 <21");
  } catch {
    threw = true;
  }
  if (!threw) failures.push("an unsupported range was converted");
  if (buildSbom({ manifest, tarballSha256: "a".repeat(64), assets: null, source }).serialNumber !== good.serialNumber) failures.push("the serial number is not deterministic");
  const compiled = [{ name: "@pandacss/generator", version: "1.12.1", license: "MIT", supplier: "Segun Adebayo", copyright: "Copyright (c) 2023 Segun Adebayo", source: "https://github.com/chakra-ui/panda", sources: "src/styled-system/" }];
  const withCode = buildSbom({ manifest, tarballSha256: "a".repeat(64), assets: null, source, compiled });
  if (!validate(withCode)) failures.push(`an SBOM with compiled third-party code is invalid: ${JSON.stringify(validate.errors?.slice(0, 3))}`);
  if (!withCode.components.some((c) => c.purl === "pkg:npm/%40pandacss/generator@1.12.1" && c.licenses[0].license.id === "MIT")) failures.push("compiled third-party code is not a component");
  if (failures.length > 0) {
    console.error(`SBOM self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("SBOM self-test passed: 10 checks against the CycloneDX 1.7.2 schema");
}

function main() {
  const index = process.argv.indexOf("--packs");
  const packsDir = path.resolve(index > -1 ? process.argv[index + 1] : "artifacts/packages");
  const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
  const sha = process.env.GITHUB_SHA ?? git("rev-parse", "HEAD");
  const source = {
    sha,
    time: new Date(Number(process.env.SOURCE_DATE_EPOCH ?? git("show", "-s", "--format=%ct", sha)) * 1000).toISOString().replace(/\.000Z$/, "Z"),
    repository: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}` : git("remote", "get-url", "origin").replace(/\.git$/, ""),
  };

  // Copied assets of @scnx/system: provenance record plus published paths.
  const systemDir = path.resolve("packages/design-system");
  const provenance = JSON.parse(fs.readFileSync(path.join(systemDir, "assets/fonts/provenance.json"), "utf8"));
  const tokensConfig = JSON.parse(fs.readFileSync(path.join(systemDir, "tokens.config.json"), "utf8"));
  const fontFiles = Object.values(tokensConfig.fonts.assets).flatMap((asset) =>
    asset.faces.map((face) => ({ file: `dist/${face.publish}`, sha256: provenance.files[path.basename(face.source)] })),
  );

  const validate = cycloneDxValidator();
  const outDir = path.join(packsDir, "sbom");
  fs.mkdirSync(outDir, { recursive: true });
  const report = { schemaVersion: 1, specVersion: "1.7", source, sboms: [] };
  for (const pkg of packReport.packages) {
    const root = path.join(packsDir, pkg.tarball.replace(/\.tgz$/, ""), "package");
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const assets = manifest.name === "@scnx/system" ? { component: provenance.component, files: fontFiles } : null;
    for (const file of assets?.files ?? []) {
      if (sha256(path.join(root, file.file)) !== file.sha256) throw new Error(`${manifest.name}: ${file.file} differs from its provenance record`);
    }
    const compiled = thirdPartyCode(path.resolve(packageDirOf(manifest.name))).components;
    const sbom = buildSbom({ manifest, tarballSha256: sha256(path.join(packsDir, pkg.tarball)), assets, source, compiled });
    if (!validate(sbom)) throw new Error(`${manifest.name}: SBOM fails the CycloneDX 1.7 schema: ${JSON.stringify(validate.errors, null, 2)}`);
    const file = path.join(outDir, `${pkg.tarball.replace(/\.tgz$/, "")}.cdx.json`);
    fs.writeFileSync(file, `${JSON.stringify(sbom, null, 2)}\n`);
    report.sboms.push({ package: manifest.name, version: manifest.version, tarball: pkg.tarball, sbom: path.relative(packsDir, file), sha256: sha256(file), components: sbom.components.length });
  }
  fs.writeFileSync(path.join(packsDir, "sbom-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  for (const entry of report.sboms) console.log(`${entry.package}@${entry.version}: ${entry.sbom} (${entry.components} components, sha256 ${entry.sha256.slice(0, 16)}…)`);
  console.log(`CycloneDX 1.7 SBOMs valid against the official 1.7.2 schema; report: ${path.join(packsDir, "sbom-report.json")}`);
}

if (process.argv.includes("--self-test")) selfTest();
else main();
