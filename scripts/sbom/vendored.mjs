// Reads a vendored CycloneDX schema file after checking its SHA-256 against
// scripts/sbom/schema/provenance.json, so a silently edited copy fails.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema");
const provenance = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, "provenance.json"), "utf8"));

/** The parsed JSON of a vendored schema file whose digest matches its provenance record. */
export function vendoredSchema(file) {
  const expected = provenance.files[file];
  if (!expected) throw new Error(`${file}: no provenance record in scripts/sbom/schema/provenance.json`);
  const bytes = fs.readFileSync(path.join(SCHEMA_DIR, file));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw new Error(`${file}: SHA-256 ${actual} differs from its provenance record ${expected}`);
  return JSON.parse(bytes.toString("utf8"));
}
