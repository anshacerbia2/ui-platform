#!/usr/bin/env node
// PLAN P0 row 10c advisory gate (TDD packaging V1 and V3; STD-GLB-FE-006
// section 3.10). Runs `pnpm audit --json` against the workspace lockfile and
// against every consumer-fixture lockfile collected under --lockfiles, then
// fails on:
// - a high or critical advisory not excepted by a valid VEX statement;
// - any high or critical advisory against React, React DOM,
//   `react-server-dom-*`, or a meta-framework (never excepted);
// - a moderate advisory against those packages published 30 or more days ago;
// - a malformed or expired VEX statement, or an audit that did not complete
//   (a registry error fails closed).
//
//   node scripts/security/audit.mjs [--lockfiles <dir>] [--vex security/vex.json] [--out <report dir>]
//   node scripts/security/audit.mjs --self-test

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DAY = 24 * 60 * 60 * 1000;
const VEX_MAX_DAYS = 90;
const MODERATE_DAYS = 30;
// CISA, Minimum Requirements for VEX (2023), section 2.7.1.1.3.
export const JUSTIFICATIONS = [
  "Component_not_present",
  "Vulnerable_code_not_present",
  "Vulnerable_code_not_in_execute_path",
  "Vulnerable_code_cannot_be_controlled_by_adversary",
  "Inline_mitigations_already_exist",
];

/** React, React DOM, server-component packages, and meta-frameworks (STD-GLB-FE-006 section 3.10). */
export function isReactFamily(name) {
  return (
    name === "react" ||
    name === "react-dom" ||
    name.startsWith("react-server-dom-") ||
    name === "next" ||
    name === "react-router" ||
    name.startsWith("@react-router/") ||
    name.startsWith("@remix-run/")
  );
}

/** Problems with one VEX statement, judged at `now`. */
export function vexProblems(statement, now) {
  const problems = [];
  const id = statement?.vul_id ?? "<no vul_id>";
  if (!/^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$/.test(statement?.vul_id ?? "")) problems.push(`${id}: vul_id must be a GHSA identifier`);
  if (typeof statement?.product !== "string" || statement.product === "") problems.push(`${id}: product is required`);
  if (statement?.status !== "not_affected") problems.push(`${id}: only status "not_affected" can except an advisory`);
  if (!JUSTIFICATIONS.includes(statement?.justification)) problems.push(`${id}: justification must be one of ${JUSTIFICATIONS.join(", ")}`);
  if (typeof statement?.impact_statement !== "string" || statement.impact_statement.trim() === "") problems.push(`${id}: impact_statement is required`);
  if (typeof statement?.owner !== "string" || statement.owner.trim() === "") problems.push(`${id}: owner is required`);
  const issued = Date.parse(statement?.timestamp);
  const expires = Date.parse(statement?.expires);
  if (Number.isNaN(issued)) problems.push(`${id}: timestamp must be an ISO 8601 date`);
  if (Number.isNaN(expires)) problems.push(`${id}: expires must be an ISO 8601 date`);
  if (!Number.isNaN(issued) && !Number.isNaN(expires) && expires - issued > VEX_MAX_DAYS * DAY) problems.push(`${id}: expires more than ${VEX_MAX_DAYS} days after timestamp`);
  if (!Number.isNaN(expires) && expires <= now) problems.push(`${id}: expired on ${statement.expires}`);
  return problems;
}

/**
 * Judge one audit result.
 * @param {{ advisories?: Record<string, any>, error?: unknown }} audit parsed `pnpm audit --json`
 * @param {{ statements: object[] }} vex
 * @param {number} now
 * @returns {{ failures: string[], findings: object[] }}
 */
export function judge(audit, vex, now) {
  const failures = [];
  if (!audit || typeof audit !== "object" || audit.error || typeof audit.advisories !== "object") {
    return { failures: [`audit did not complete: ${JSON.stringify(audit?.error ?? audit).slice(0, 300)}`], findings: [] };
  }
  const statements = vex.statements ?? [];
  for (const statement of statements) failures.push(...vexProblems(statement, now));
  const findings = [];
  for (const advisory of Object.values(audit.advisories)) {
    const id = advisory.github_advisory_id ?? `npm-${advisory.id}`;
    const name = advisory.module_name;
    const severity = advisory.severity;
    const published = Date.parse(advisory.created ?? "");
    const ageDays = Number.isNaN(published) ? null : Math.floor((now - published) / DAY);
    const reactFamily = isReactFamily(name);
    const excepted = statements.find((s) => s.vul_id === id && s.product === name && vexProblems(s, now).length === 0);
    let outcome = "reported";
    if (severity === "high" || severity === "critical") {
      if (reactFamily) outcome = "blocks: React family or meta-framework, patch the resolved version";
      else if (excepted) outcome = "excepted by VEX";
      else outcome = "blocks";
    } else if (severity === "moderate" && reactFamily && ageDays !== null && ageDays >= MODERATE_DAYS) {
      outcome = `blocks: React-family moderate published ${ageDays} days ago`;
    }
    const paths = [...new Set((advisory.findings ?? []).flatMap((f) => f.paths ?? []))];
    findings.push({ id, package: name, severity, vulnerable: advisory.vulnerable_versions, published: advisory.created ?? null, outcome, paths });
    if (outcome.startsWith("blocks")) failures.push(`${severity} ${id} ${name} ${advisory.vulnerable_versions}: ${outcome} (${paths.slice(0, 3).join("; ")})`);
  }
  return { failures, findings };
}

function runAudit(cwd, isolated) {
  let stdout;
  // A fixture lockfile collected inside the repository must not resolve to the workspace.
  const args = ["audit", "--json", ...(isolated ? ["--ignore-workspace"] : [])];
  try {
    stdout = execFileSync("pnpm", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    // pnpm audit exits non-zero when it finds advisories; the JSON is still on stdout.
    stdout = error.stdout ?? "";
  }
  try {
    return JSON.parse(stdout);
  } catch {
    return { error: `unparseable audit output: ${stdout.slice(0, 200)}` };
  }
}

function selfTest() {
  const now = Date.parse("2026-10-02T00:00:00Z");
  const advisory = (over) => ({ id: 1, github_advisory_id: "GHSA-2w69-qvjg-hvjx", module_name: "left-pad", severity: "high", vulnerable_versions: "<2", created: "2026-09-01T00:00:00Z", findings: [{ paths: [".>left-pad"] }], ...over });
  const good = { vul_id: "GHSA-2w69-qvjg-hvjx", product: "left-pad", status: "not_affected", justification: "Vulnerable_code_not_in_execute_path", impact_statement: "Only the build reads it.", owner: "UI Platform Team", timestamp: "2026-09-20", expires: "2026-12-01" };
  const run = (advisories, statements = []) => judge({ advisories: Object.fromEntries(advisories.map((a, i) => [i, a])) }, { statements }, now).failures;
  const cases = [
    ["clean audit", run([]), 0],
    ["high blocks", run([advisory()]), 1],
    ["critical blocks", run([advisory({ severity: "critical" })]), 1],
    ["low is reported", run([advisory({ severity: "low" })]), 0],
    ["moderate outside the React family is reported", run([advisory({ severity: "moderate" })]), 0],
    ["valid VEX excepts a high", run([advisory()], [good]), 0],
    ["VEX never excepts the React family", run([advisory({ module_name: "react-dom" })], [{ ...good, product: "react-dom" }]), 1],
    ["meta-framework high blocks", run([advisory({ module_name: "next" })]), 1],
    ["fresh React-family moderate is reported", run([advisory({ module_name: "react-server-dom-webpack", severity: "moderate", created: "2026-09-20T00:00:00Z" })]), 0],
    ["30-day React-family moderate blocks", run([advisory({ module_name: "react", severity: "moderate", created: "2026-08-01T00:00:00Z" })]), 1],
    ["expired VEX fails", run([advisory()], [{ ...good, expires: "2026-09-30" }]).length >= 2, true],
    ["VEX beyond 90 days fails", run([], [{ ...good, expires: "2027-03-01" }]), 1],
    ["unknown justification fails", run([], [{ ...good, justification: "not_used" }]), 1],
    ["VEX without impact statement fails", run([], [{ ...good, impact_statement: "" }]), 1],
    ["incomplete audit fails closed", judge({ error: { code: "ERR_PNPM_AUDIT_BAD_RESPONSE" } }, { statements: [] }, now).failures, 1],
  ];
  const failed = cases.filter(([, actual, expected]) => (typeof expected === "boolean" ? actual !== expected : actual.length !== expected));
  for (const [label, actual, expected] of failed) console.error(`${label}: expected ${expected}, got ${JSON.stringify(actual)}`);
  if (failed.length > 0) process.exit(1);
  console.log(`Advisory gate self-test passed: ${cases.length} cases`);
}

function main() {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index > -1 ? process.argv[index + 1] : fallback;
  };
  const vexPath = path.resolve(arg("--vex", "security/vex.json"));
  const vex = JSON.parse(fs.readFileSync(vexPath, "utf8"));
  const lockfilesDir = arg("--lockfiles");
  const outDir = path.resolve(arg("--out", "artifacts/security"));
  const now = Date.now();

  const graphs = [{ graph: "workspace", dir: process.cwd(), isolated: false }];
  if (lockfilesDir) {
    const root = path.resolve(lockfilesDir);
    for (const name of fs.readdirSync(root).sort()) {
      if (fs.existsSync(path.join(root, name, "pnpm-lock.yaml"))) graphs.push({ graph: name, dir: path.join(root, name), isolated: true });
    }
    if (graphs.length === 1) throw new Error(`No fixture lockfiles under ${root}`);
  }

  const report = { schemaVersion: 1, vex: path.relative(process.cwd(), vexPath), graphs: [] };
  let failed = false;
  for (const { graph, dir, isolated } of graphs) {
    const { failures, findings } = judge(runAudit(dir, isolated), vex, now);
    report.graphs.push({ graph, result: failures.length === 0 ? "pass" : "fail", findings, failures });
    const counts = findings.reduce((acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] ?? 0) + 1 }), {});
    if (failures.length > 0) {
      failed = true;
      console.error(`${graph}: FAILED\n  ${failures.join("\n  ")}`);
    } else {
      console.log(`${graph}: no blocking advisory (${JSON.stringify(counts)})`);
    }
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "audit-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (failed) process.exit(1);
  console.log(`Advisory gate passed for ${graphs.length} resolved graphs; report: ${path.join(outDir, "audit-report.json")}`);
}

if (process.argv.includes("--self-test")) selfTest();
else main();
