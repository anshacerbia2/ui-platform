// Component specifications (ADR-UIP-CMP-001; TDD primitives P20-P23).
// Every public JavaScript entry of both packages has exactly one
// `<name>.spec.json` in the folder of its source, where `<name>` is the last
// segment of its subpath. The behavior inventory is generated from them.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { packageEntries } from "../package-entries.mjs";
import { styledContext, styledFindings } from "./styled.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const schemaDir = path.join(root, "scripts/specs/schema");
const PACKAGES = [
  { name: "@scnx/core-ui", dir: "packages/core-ui" },
  { name: "@scnx/system", dir: "packages/design-system" },
];
const KINDS = ["primitive", "styled", "entry"];
export const INVENTORY = "packages/core-ui/behavior-inventory.json";

function validators() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  for (const file of fs.readdirSync(schemaDir).filter((f) => f.endsWith(".schema.json")).sort()) {
    ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8")));
  }
  const id = (kind) => `https://github.com/anshacerbia2/ui-platform/blob/main/scripts/specs/schema/${kind}.schema.json`;
  return Object.fromEntries(KINDS.map((kind) => [kind, ajv.getSchema(id(kind))]));
}

/** The specification file a public entry must have, relative to the repository root. */
export function specPath(packageDir, entry) {
  const name = entry.subpath.split("/").pop();
  return path.join(packageDir, path.dirname(entry.source), `${name}.spec.json`).replaceAll("\\", "/");
}

/**
 * Rule findings for a set of specifications, independent of the file system.
 * @param {Array<{ file: string, entry: string, spec: unknown }>} expected one row per public entry
 * @param {string[]} found every `*.spec.json` file in the package sources
 * @param {Record<string, (value: unknown) => boolean & { errors?: unknown[] }>} validate
 */
export function specFindings(expected, found, validate) {
  const findings = [];
  const wanted = new Set(expected.map((row) => row.file));
  for (const file of found) if (!wanted.has(file)) findings.push(`${file}: no public entry owns this specification`);
  const names = new Map();
  for (const { file, entry, spec } of expected) {
    if (spec === undefined) {
      findings.push(`${file}: missing; ${entry} needs exactly one specification (ADR-UIP-CMP-001)`);
      continue;
    }
    const check = validate[spec?.kind];
    if (!check) {
      findings.push(`${file}: kind must be one of ${KINDS.join(", ")}`);
      continue;
    }
    if (!check(spec)) {
      for (const error of check.errors) findings.push(`${file}: ${error.instancePath || "/"} ${error.message}`);
      continue;
    }
    if (spec.entry !== entry) findings.push(`${file}: entry is ${spec.entry}, not ${entry}`);
    if (spec.kind === "primitive") {
      if (names.has(spec.name)) findings.push(`${file}: name ${spec.name} is also declared by ${names.get(spec.name)}`);
      names.set(spec.name, file);
      const parts = new Set(spec.parts.map((part) => part.name));
      if (parts.size !== spec.parts.length) findings.push(`${file}: part names must be unique`);
      for (const key of spec.keys) {
        if (!parts.has(key.part)) findings.push(`${file}: key ${key.key} names undeclared part ${key.part}`);
        if (key.expect && !parts.has(key.expect.part)) findings.push(`${file}: key ${key.key} expects on undeclared part ${key.expect.part}`);
      }
    }
  }
  return findings;
}

function sourceSpecs(dir) {
  const out = [];
  const walk = (current) => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.name.endsWith(".spec.json")) out.push(path.relative(root, full).replaceAll("\\", "/"));
    }
  };
  walk(path.join(root, dir, "src"));
  return out.sort();
}

/** Read and check every specification of both packages. */
export function loadSpecs() {
  const validate = validators();
  const expected = [];
  const found = [];
  for (const pkg of PACKAGES) {
    found.push(...sourceSpecs(pkg.dir));
    for (const entry of packageEntries(path.join(root, pkg.dir)).filter((e) => e.kind === "javascript")) {
      const file = specPath(pkg.dir, entry);
      const full = path.join(root, file);
      const spec = fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, "utf8")) : undefined;
      expected.push({ file, entry: `${pkg.name}${entry.subpath.slice(1)}`, spec });
    }
  }
  const findings = specFindings(expected, found, validate);
  // Styled rules read the built stylesheet and the API reports (TDD styled CS2, CS3).
  const styled = expected.filter((row) => row.spec?.kind === "styled");
  if (findings.length === 0 && styled.length > 0) {
    const css = path.join(root, "packages/design-system/dist/tokens/css/default.css");
    if (!fs.existsSync(css)) findings.push("styled specifications need the built packages; run pnpm build first");
    else {
      const tokens = new Set([...fs.readFileSync(css, "utf8").matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      const primitives = expected.filter((row) => row.spec.kind === "primitive").map((row) => row.spec);
      for (const { file, spec } of styled) {
        for (const finding of styledFindings(spec, styledContext(spec, primitives, tokens))) findings.push(`${file}: ${finding}`);
      }
    }
  }
  return { specs: expected, findings };
}

/** The behavior inventory (TDD primitives P12, P13) generated from specifications. */
export function inventoryFrom(specs) {
  const byEntry = (a, b) => a.entry.localeCompare(b.entry);
  const primitives = specs
    .filter((s) => s.kind === "primitive")
    .sort(byEntry)
    .map(({ $schema: _, kind: __, ...contract }) => contract);
  const entries = specs
    .filter((s) => s.kind === "entry" || s.kind === "styled")
    .sort(byEntry)
    .map(({ entry, stability, entryKind }) => ({ entry, stability, kind: entryKind }));
  return {
    schemaVersion: 1,
    contractVersion: "0.1.0",
    source: "Generated from the component specifications by scripts/specs/inventory.mjs (ADR-UIP-CMP-001; TDD primitives P12, P13, P20). Do not edit.",
    primitives,
    entries,
  };
}

export const serialize = (inventory) => `${JSON.stringify(inventory, null, 2)}\n`;
