#!/usr/bin/env node
// PLAN P0 row 11 evidence packet (TDD packaging R1-R5). Reads the artifacts of
// one CI run and writes `p0-evidence.json`, validated against
// scripts/evidence/schema.json. The packet embeds its evidence: every job's
// result, the SHA-256 of every report, per-tarball digests (published `.tgz`,
// content tar, rebuild content tar, SBOM) and verified attestations,
// architecture statuses copied verbatim, entry stability, and known limits.
// Anything missing makes the packet fail (exit 1); the packet is still written.
//
//   node scripts/evidence.mjs --artifacts <dir> --jobs <jobs.json> --architecture <checkout>
//     [--run-url <url>] [--verify-attestations] [--out <dir>]
//   node scripts/evidence.mjs --self-test

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(fs.readFileSync(path.join(here, "evidence", "schema.json"), "utf8"));
const PENDING_NOTICE = /Revision pending exact-commit ratification/;

// PLAN P0 rows and the component workshop, each with the CI jobs and the
// reports (relative to the artifacts directory) that evidence it.
export const ROWS = [
  { row: "0", title: "Clean install gate and required CI", jobs: ["Clean install", "CI policy"], reports: [] },
  { row: "1", title: "Central architecture linter and document contract", jobs: ["Documentation gates", "Central governance linter / Enforce GDC Compliance"], reports: [] },
  { row: "2", title: "Source tests and declaration heap", jobs: ["Source tests", "Build with default heap"], reports: ["build-memory/build-time.txt", "build-memory/build.log"] },
  { row: "3", title: "Packaging and isolated consumers", jobs: ["Packed consumer"], reports: ["packed-packages/pack-report.json", "packed-packages/consumer-report.json"] },
  { row: "4", title: "Token output", jobs: ["Token gate"], reports: ["token-report/token-report.json"] },
  { row: "5", title: "Component CSS delivery", jobs: ["Packed consumer"], reports: ["packed-packages/browser-components-report.json"] },
  { row: "6", title: "Theme provider and transitions", jobs: ["Packed consumer"], reports: ["packed-packages/browser-theme-report.json"] },
  { row: "7", title: "Primitive behavior", jobs: ["Source tests", "Packed consumer"], reports: ["packed-packages/browser-theme-report.json"] },
  { row: "8", title: "Entry environments and Next.js App Router", jobs: ["Packed consumer"], reports: ["packed-packages/nextjs-report.json", "packed-packages/pack-report.json"] },
  { row: "9", title: "Conditional federation evaluation", jobs: ["Packed consumer"], reports: ["packed-packages/federation-report.json"] },
  {
    row: "10",
    title: "Security, supply chain, side effects, strict CSP",
    jobs: ["Packed consumer", "Provenance and SBOM attestations"],
    reports: ["packed-packages/imports-report.json", "packed-packages/security/audit-report.json", "packed-packages/security/license-report.json", "packed-packages/sbom-report.json"],
  },
  { row: "W1-W2", title: "Component workshop", jobs: ["Storybook tests", "Chromatic visual review"], reports: [] },
];

// Unsupported capabilities (TDD packaging R5): each must stay absent.
const KNOWN_LIMITS = [
  { limit: "No CommonJS output", check: (manifests) => manifests.every((m) => !JSON.stringify(m.exports).includes('"require"')) },
  { limit: "Module Federation is evaluated, not adopted: no federation entry", check: (manifests) => manifests.every((m) => !Object.keys(m.exports).some((k) => /federation|remote/i.test(k))) },
  { limit: "The Next.js fixture runs without a nonce CSP (TDD packaging S1)", check: () => true },
  { limit: "No license allow-list is enforced (TDD packaging V4)", check: () => true },
  { limit: "Tarball bytes are retained for at most 90 days (TDD packaging R2)", check: () => true },
];

const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/** IDs named in SAD-003's traceability paragraph, with "X-001 through -003" expanded. */
export function authorityIds(sadText) {
  const section = sadText.split(/^## 2\. Enterprise Traceability\s*$/m)[1]?.split(/^### /m)[0] ?? "";
  const first = section.trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ");
  const ids = new Set();
  for (const match of first.matchAll(/\b((?:PAD|SAD|ADR|STD)(?:-[A-Z]+)+)-(\d{3})(?: through -(\d{3}))?/g)) {
    const [, prefix, from, to] = match;
    for (let n = Number(from); n <= Number(to ?? from); n++) ids.add(`${prefix}-${String(n).padStart(3, "0")}`);
  }
  return [...ids];
}

/** `doc_meta` id -> { path, status, version, pending } for every Markdown record in a checkout. */
function architectureRecords(root) {
  const records = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const text = fs.readFileSync(full, "utf8");
        const meta = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
        const id = /^\s+id:\s*(\S+)/m.exec(meta)?.[1];
        if (!id) continue;
        records.set(id, {
          path: path.relative(root, full),
          status: /^\s+status:\s*(\S+)/m.exec(meta)?.[1] ?? null,
          version: /^\s+version:\s*(\S+)/m.exec(meta)?.[1] ?? null,
          pending: PENDING_NOTICE.test(text),
        });
      }
    }
  };
  walk(root);
  return records;
}

/** Radar entries with their ring, their own comment lines, and whether a "pending ARB" comment names them. */
export function radarEntries(yamlText) {
  const entries = [];
  let ring = null;
  let comments = [];
  const pendingLines = [];
  let current = null;
  for (const line of yamlText.split("\n")) {
    const ringMatch = /^  (adopt|trial|assess|hold):\s*$/.exec(line);
    if (ringMatch) {
      ring = ringMatch[1];
      comments = [];
      continue;
    }
    const comment = /^\s+#\s?(.*)$/.exec(line);
    if (comment) {
      if (/pending ARB/i.test(comment[1])) pendingLines.push(comment[1]);
      if (current && /^      #/.test(line)) current.comments.push(comment[1]);
      else comments.push(comment[1]);
      continue;
    }
    const owner = /^      owner:\s*(.+?)\s*$/.exec(line);
    if (owner && current) {
      current.owner = owner[1];
      continue;
    }
    const name = /^    - name:\s*(\S+)/.exec(line);
    if (name && ring) {
      current = { name: name[1], ring, owner: null, comments: [...comments], pendingArb: false };
      comments = [];
      entries.push(current);
    } else if (/^\s*$/.test(line)) {
      comments = [];
    }
  }
  for (const entry of entries) {
    const word = new RegExp(`(^|[^a-z0-9-])${entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9-]|$)`, "i");
    entry.pendingArb = pendingLines.some((line) => word.test(line)) || entry.comments.some((c) => /pending ARB/i.test(c));
  }
  return entries;
}

function verifyAttestation(file, repository, predicateType) {
  try {
    const out = execFileSync("gh", ["attestation", "verify", file, "-R", repository, "--predicate-type", predicateType, "--format", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const signer = JSON.parse(out)[0]?.verificationResult?.signature?.certificate?.buildSignerURI ?? null;
    return { verified: true, signer };
  } catch (error) {
    return { verified: false, signer: null, error: String(error.stderr ?? error.message).slice(0, 300) };
  }
}

/** Build the packet. Pure apart from reading the given directories and, when asked, running `gh`. */
export function buildPacket({ artifactsDir, jobs, architectureDir, uiDir, source, run, verifyAttestations }) {
  const failures = [];
  const jobByName = new Map(jobs.map((job) => [job.name, job]));
  const evidenceJobs = jobs.filter((job) => !/^P0 evidence/.test(job.name)).map((job) => ({ name: job.name, conclusion: job.conclusion ?? job.status, url: job.html_url ?? null }));

  const rows = ROWS.map(({ row, title, jobs: rowJobs, reports }) => {
    const rowFailures = [];
    const jobResults = rowJobs.map((name) => {
      const job = jobByName.get(name);
      if (!job) rowFailures.push(`job "${name}" did not run`);
      else if (job.conclusion !== "success") rowFailures.push(`job "${name}" concluded ${job.conclusion}`);
      return { name, conclusion: job?.conclusion ?? "missing" };
    });
    const reportDigests = reports.map((file) => {
      const full = path.join(artifactsDir, file);
      if (!fs.existsSync(full)) {
        rowFailures.push(`report ${file} is missing`);
        return { file, sha256: null };
      }
      return { file, sha256: sha256(full) };
    });
    failures.push(...rowFailures.map((f) => `row ${row}: ${f}`));
    return { row, title, result: rowFailures.length === 0 ? "pass" : "fail", jobs: jobResults, reports: reportDigests, failures: rowFailures };
  });

  // Tarballs: published bytes, content tar, a rebuild on another runner, SBOM, attestations.
  const packDir = path.join(artifactsDir, "packed-packages");
  const packReport = JSON.parse(fs.readFileSync(path.join(packDir, "pack-report.json"), "utf8"));
  const rebuildPath = path.join(artifactsDir, "rebuild", "pack-report.json");
  const rebuild = fs.existsSync(rebuildPath) ? JSON.parse(fs.readFileSync(rebuildPath, "utf8")) : null;
  if (!rebuild) failures.push("rebuild pack report is missing (TDD packaging R3)");
  const sbomReportPath = path.join(packDir, "sbom-report.json");
  const sbomReport = fs.existsSync(sbomReportPath) ? JSON.parse(fs.readFileSync(sbomReportPath, "utf8")) : { sboms: [] };
  const manifests = [];
  const packages = packReport.packages.map((pkg) => {
    const tarball = path.join(packDir, pkg.tarball);
    const tarballSha256 = fs.existsSync(tarball) ? sha256(tarball) : null;
    if (tarballSha256 !== pkg.tarballSha256) failures.push(`${pkg.name}: tarball digest differs from the pack report`);
    const rebuilt = rebuild?.packages.find((p) => p.name === pkg.name);
    const reproducible = Boolean(rebuilt && pkg.contentSha256 && rebuilt.contentSha256 === pkg.contentSha256);
    if (!reproducible) failures.push(`${pkg.name}: content digest ${pkg.contentSha256 ?? "missing"} does not match the rebuild ${rebuilt?.contentSha256 ?? "missing"}`);
    const sbomEntry = sbomReport.sboms.find((s) => s.package === pkg.name);
    const sbomFile = sbomEntry ? path.join(packDir, sbomEntry.sbom) : null;
    const sbomSha256 = sbomFile && fs.existsSync(sbomFile) ? sha256(sbomFile) : null;
    if (!sbomSha256) failures.push(`${pkg.name}: SBOM is missing`);
    const attestations = verifyAttestations
      ? { provenance: verifyAttestation(tarball, source.repository, "https://slsa.dev/provenance/v1"), sbom: verifyAttestation(tarball, source.repository, "https://cyclonedx.org/bom") }
      : null;
    if (attestations && (!attestations.provenance.verified || !attestations.sbom.verified)) failures.push(`${pkg.name}: an attestation does not verify`);
    // The uploaded artifact holds the tarball, not its extracted tree.
    const manifest = JSON.parse(execFileSync("tar", ["-xzOf", tarball, "package/package.json"], { encoding: "utf8" }));
    manifests.push(manifest);
    return { name: pkg.name, version: pkg.version, tarball: pkg.tarball, tarballSha256, contentSha256: pkg.contentSha256 ?? null, rebuildContentSha256: rebuilt?.contentSha256 ?? null, reproducible, sbom: sbomEntry?.sbom ?? null, sbomSha256, attestations };
  });

  // Architecture statuses, verbatim (TDD packaging R4).
  const sadRecords = architectureRecords(architectureDir);
  const sad = sadRecords.get("SAD-003");
  if (!sad) failures.push("SAD-003 not found in the architecture checkout");
  const ids = ["SAD-003", ...(sad ? authorityIds(fs.readFileSync(path.join(architectureDir, sad.path), "utf8")) : [])];
  const records = ids.map((id) => {
    const record = sadRecords.get(id);
    if (!record) failures.push(`architecture record ${id} not found`);
    return { id, path: record?.path ?? null, status: record?.status ?? null, version: record?.version ?? null, pendingRatification: record?.pending ?? false };
  });
  const radar = radarEntries(fs.readFileSync(path.join(architectureDir, "01-enterprise", "tech-radar.yaml"), "utf8")).filter((entry) => entry.owner === "UI Platform Team");

  // Revisions pending exact-commit ratification in either repository (TDD packaging R6).
  const pending = [
    ...[...sadRecords].filter(([, r]) => r.pending).map(([id, r]) => ({ repository: "scnehaux-architecture", id, path: r.path })),
    ...fs
      .readdirSync(path.join(uiDir, "docs", "designs"))
      .filter((file) => file.endsWith(".md") && PENDING_NOTICE.test(fs.readFileSync(path.join(uiDir, "docs", "designs", file), "utf8")))
      .map((file) => ({ repository: "ui-platform", id: file.replace(/\.md$/, ""), path: `docs/designs/${file}` })),
  ];

  // Entry stability and known limits (TDD packaging R5).
  const inventory = JSON.parse(fs.readFileSync(path.join(uiDir, "packages", "core-ui", "behavior-inventory.json"), "utf8"));
  const stabilityByEntry = new Map(inventory.primitives.map((p) => [p.entry, p.stability]));
  const entries = packReport.packages.flatMap((pkg) => Object.keys(pkg.environments).map((subpath) => {
    const entry = `${pkg.name}${subpath.slice(1)}`;
    return { entry, stability: stabilityByEntry.get(entry) ?? "unclassified" };
  }));
  const anyRowFailed = rows.some((r) => r.result === "fail");
  for (const e of entries) if (e.stability === "stable" && anyRowFailed) failures.push(`${e.entry} is stable while a P0 row failed`);
  const knownLimits = KNOWN_LIMITS.map(({ limit, check }) => {
    const holds = check(manifests);
    if (!holds) failures.push(`known limit violated: ${limit}`);
    return { limit, absentFromExports: holds };
  });

  return {
    schema: "scnx.p0-evidence/1",
    source,
    run,
    jobs: evidenceJobs,
    rows,
    packages,
    architecture: { repository: "anshacerbia2/scnehaux-architecture", commit: gitHead(architectureDir), records, radar },
    pendingRatification: pending,
    entries,
    knownLimits,
    result: failures.length === 0 ? "pass" : "fail",
    failures,
  };
}

function gitHead(dir) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function validator() {
  const ajv = new Ajv({ strict: true, allErrors: true });
  addFormats(ajv);
  return ajv.compile(SCHEMA);
}

function selfTest() {
  const failures = [];
  const sad = "## 2. Enterprise Traceability\n\nThe system fulfills approved PAD-PLT-003. Global frontend authority includes\nADR-GLB-FE-010 and replacement decisions ADR-GLB-FE-011 through -013 according\nto their lifecycle. UI authority includes ADR-UIP-TKN-001\nthrough -003 and STD-UIP-TKN-002.\n\nLater paragraph ADR-XXX-999.\n\n### 2.1 Next\n";
  const ids = authorityIds(sad);
  const expected = ["PAD-PLT-003", "ADR-GLB-FE-010", "ADR-GLB-FE-011", "ADR-GLB-FE-012", "ADR-GLB-FE-013", "ADR-UIP-TKN-001", "ADR-UIP-TKN-002", "ADR-UIP-TKN-003", "STD-UIP-TKN-002"];
  if (JSON.stringify(ids) !== JSON.stringify(expected)) failures.push(`authorityIds: ${JSON.stringify(ids)}`);
  const radar = radarEntries("technology_radar:\n  trial:\n    # pending ARB: alpha and beta trial entries.\n    - name: alpha\n      owner: UI Platform Team\n\n    - name: beta\n      owner: UI Platform Team\n      # trial review is pending ARB.\n\n    - name: gamma\n      owner: UI Platform Team\n  assess:\n    - name: alphabet\n      owner: Platform Team\n");
  const byName = Object.fromEntries(radar.map((e) => [e.name, e]));
  if (!byName.alpha?.pendingArb || !byName.beta?.pendingArb || byName.gamma?.pendingArb || byName.alphabet?.pendingArb) failures.push(`radarEntries pending: ${JSON.stringify(radar)}`);
  if (byName.alphabet?.ring !== "assess" || byName.alpha?.ring !== "trial") failures.push("radarEntries rings");
  if (byName.alpha?.owner !== "UI Platform Team" || byName.alphabet?.owner !== "Platform Team") failures.push("radarEntries owners");
  const validate = validator();
  if (validate({ schema: "scnx.p0-evidence/1" })) failures.push("an incomplete packet validated");
  if (failures.length > 0) {
    console.error(`Evidence self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("Evidence self-test passed: authority IDs, radar parsing, schema rejection");
}

function main() {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index > -1 ? process.argv[index + 1] : fallback;
  };
  const artifactsDir = path.resolve(arg("--artifacts", "artifacts/evidence-input"));
  const jobsFile = JSON.parse(fs.readFileSync(path.resolve(arg("--jobs", "jobs.json")), "utf8"));
  const outDir = path.resolve(arg("--out", "artifacts/evidence"));
  const repository = process.env.GITHUB_REPOSITORY ?? "anshacerbia2/ui-platform";
  const packet = buildPacket({
    artifactsDir,
    jobs: jobsFile.jobs ?? jobsFile,
    architectureDir: path.resolve(arg("--architecture", "../scnehaux-architecture")),
    uiDir: process.cwd(),
    source: { repository, commit: process.env.GITHUB_SHA ?? gitHead(process.cwd()), ref: process.env.GITHUB_REF ?? null },
    run: { id: Number(process.env.GITHUB_RUN_ID ?? 0) || null, attempt: Number(process.env.GITHUB_RUN_ATTEMPT ?? 0) || null, url: arg("--run-url", null), event: process.env.GITHUB_EVENT_NAME ?? null },
    verifyAttestations: process.argv.includes("--verify-attestations"),
  });
  const validate = validator();
  if (!validate(packet)) {
    packet.result = "fail";
    packet.failures.push(`packet fails its schema: ${JSON.stringify(validate.errors).slice(0, 500)}`);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "p0-evidence.json");
  fs.writeFileSync(file, `${JSON.stringify(packet, null, 2)}\n`);
  for (const row of packet.rows) console.log(`row ${row.row.padEnd(5)} ${row.result.padEnd(4)} ${row.title}${row.failures.length ? ` — ${row.failures.join("; ")}` : ""}`);
  for (const pkg of packet.packages) console.log(`${pkg.name}@${pkg.version}: tgz ${pkg.tarballSha256?.slice(0, 12)} content ${pkg.contentSha256?.slice(0, 12)} reproducible=${pkg.reproducible}${pkg.attestations ? ` provenance=${pkg.attestations.provenance.verified} sbom=${pkg.attestations.sbom.verified}` : ""}`);
  console.log(`${packet.architecture.records.length} architecture records, ${packet.architecture.radar.length} radar entries, ${packet.pendingRatification.length} revisions pending ratification`);
  console.log(`P0 evidence packet ${packet.result}: ${file} (sha256 ${sha256(file)})`);
  if (packet.result !== "pass") {
    console.error(packet.failures.join("\n"));
    process.exit(1);
  }
}

if (process.argv.includes("--self-test")) selfTest();
else main();
