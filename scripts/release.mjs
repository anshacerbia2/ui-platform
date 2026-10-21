#!/usr/bin/env node
// Release verification (ADR-UIP-REL-001 item 3; TDD packaging RL1-RL6). Runs in
// the release workflow before anything is staged, against the artifacts of one
// CI run, and fails unless:
// - the run is a successful CI run of a push to main of this repository;
// - every tarball's SHA-256 equals the one its pack report records;
// - both packages carry one version on the 2.0.0 pre-release line (RC3);
// - every tarball has a GitHub artifact attestation (SLSA provenance) from
//   this repository's CI workflow (TDD packaging V6).
// It prints the staging order: @scnx/core-ui before @scnx/system, its peer.
//
//   node scripts/release.mjs --run-id <id> --packs <dir> --repo <owner/name>
//   node scripts/release.mjs --self-test

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { releaseVersionFindings } from "./release-line.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const ORDER = ["@scnx/core-ui", "@scnx/system"];

/** Findings for the CI run (`gh api repos/<repo>/actions/runs/<id>`). */
export function runFindings(run, repo) {
  const findings = [];
  if (run.name !== "CI") findings.push(`run ${run.id} is "${run.name}", not the CI workflow`);
  if (run.event !== "push") findings.push(`run ${run.id} was triggered by ${run.event}, not a push`);
  if (run.head_branch !== "main") findings.push(`run ${run.id} is on ${run.head_branch}, not main`);
  if (run.status !== "completed" || run.conclusion !== "success") findings.push(`run ${run.id} is ${run.status}/${run.conclusion}, not completed/success`);
  if (run.repository?.full_name !== repo) findings.push(`run ${run.id} belongs to ${run.repository?.full_name}, not ${repo}`);
  return findings;
}

/** Findings for the tarballs of a pack report in `packsDir`, and the staging list. */
export function tarballFindings(packReport, packsDir) {
  const findings = [...releaseVersionFindings(packReport.packages)];
  const staged = [];
  for (const name of ORDER) {
    const pkg = packReport.packages.find((p) => p.name === name);
    if (!pkg) {
      findings.push(`${name} is not in the pack report`);
      continue;
    }
    const file = path.join(packsDir, pkg.tarball);
    if (!fs.existsSync(file)) findings.push(`${pkg.tarball} is missing`);
    else if (sha256(file) !== pkg.tarballSha256) findings.push(`${pkg.tarball}: SHA-256 differs from the pack report`);
    else staged.push({ name, version: pkg.version, file });
  }
  return { findings, staged };
}

function selfTest() {
  const failures = [];
  const repo = "o/r";
  const good = { id: 1, name: "CI", event: "push", head_branch: "main", status: "completed", conclusion: "success", repository: { full_name: repo } };
  const cases = [
    ["good run", runFindings(good, repo), null],
    ["pull request run", runFindings({ ...good, event: "pull_request" }, repo), "not a push"],
    ["branch run", runFindings({ ...good, head_branch: "feat/x" }, repo), "not main"],
    ["failed run", runFindings({ ...good, conclusion: "failure" }, repo), "not completed/success"],
    ["other workflow", runFindings({ ...good, name: "Chromatic" }, repo), "not the CI workflow"],
    ["fork run", runFindings({ ...good, repository: { full_name: "x/r" } }, repo), "not o/r"],
  ];
  const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "scnx-release-self-test-"));
  try {
    fs.writeFileSync(path.join(dir, "a.tgz"), "a");
    fs.writeFileSync(path.join(dir, "b.tgz"), "b");
    const report = (version, bSha = sha256(path.join(dir, "b.tgz"))) => ({
      packages: [
        { name: "@scnx/system", version, tarball: "b.tgz", tarballSha256: bSha },
        { name: "@scnx/core-ui", version, tarball: "a.tgz", tarballSha256: sha256(path.join(dir, "a.tgz")) },
      ],
    });
    const ok = tarballFindings(report("2.0.0-beta.0"), dir);
    cases.push(["good tarballs", ok.findings, null]);
    if (ok.staged.map((s) => s.name).join() !== ORDER.join()) failures.push(`staging order: ${ok.staged.map((s) => s.name)}`);
    cases.push(["changed tarball", tarballFindings(report("2.0.0-beta.0", "0".repeat(64)), dir).findings, "differs from the pack report"]);
    cases.push(["old release line", tarballFindings(report("1.0.0-beta.0"), dir).findings, "2.0.0"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  for (const [label, findings, expected] of cases) {
    if (expected === null && findings.length > 0) failures.push(`${label}: expected none, got ${findings.join("; ")}`);
    if (expected !== null && !findings.some((f) => f.includes(expected))) failures.push(`${label}: expected "${expected}", got ${findings.join("; ") || "nothing"}`);
  }
  if (failures.length > 0) {
    console.error(`Release self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`Release self-test passed: ${cases.length} cases`);
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const runId = arg("--run-id");
  const repo = arg("--repo", process.env.GITHUB_REPOSITORY);
  const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
  if (!runId || !repo) {
    console.error("usage: release.mjs --run-id <id> --packs <dir> --repo <owner/name>");
    process.exit(2);
  }
  const run = JSON.parse(execFileSync("gh", ["api", `repos/${repo}/actions/runs/${runId}`], { encoding: "utf8" }));
  const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
  const { findings, staged } = tarballFindings(packReport, packsDir);
  findings.unshift(...runFindings(run, repo));
  for (const { file } of staged) {
    try {
      execFileSync("gh", ["attestation", "verify", file, "--repo", repo, "--signer-workflow", `${repo}/.github/workflows/ci.yml`], { stdio: "pipe" });
    } catch (error) {
      findings.push(`${path.basename(file)}: no valid attestation from ${repo}'s CI workflow (${String(error.stderr ?? error.message).trim().split("\n")[0]})`);
    }
  }
  if (findings.length > 0) {
    console.error(`Release verification: FAILED, nothing is staged\n  ${findings.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`Release verification passed for ${staged.map((s) => `${s.name}@${s.version}`).join(", ")} from run ${runId} (${run.head_sha})`);
  fs.writeFileSync(path.join(packsDir, "release-order.txt"), `${staged.map((s) => s.file).join("\n")}\n`);
}
