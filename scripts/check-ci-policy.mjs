#!/usr/bin/env node
// PLAN P0 row 2 policy gate:
// - no tracked configuration raises or sets the Node/V8 heap (builds must pass
//   with the default heap of the pinned runner);
// - every package Vitest config sets `retry: 0`, and no script passes `--retry`.
// `--self-test` runs the detectors against known-good and known-bad inputs.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const heapOverride =
  /max[-_]old[-_]space[-_]size|max[-_]semi[-_]space[-_]size|max[-_]heap[-_]size|--heapsize/i;
const retryZero = /\bretry\s*:\s*0\b/;
const nonZeroRetry = /\bretry\s*:\s*(?!0\b)\d+/;
const retryFlag = /--retry\b/;

export function heapFindings(path, text) {
  return text
    .split(/\r?\n/)
    .flatMap((line, index) =>
      heapOverride.test(line) ? [`${path}:${index + 1}: heap override is not allowed`] : [],
    );
}

export function vitestFindings(path, text) {
  const findings = [];
  if (!retryZero.test(text)) findings.push(`${path}: Vitest config must set retry: 0`);
  if (nonZeroRetry.test(text)) findings.push(`${path}: Vitest retry must be 0`);
  return findings;
}

export function scriptFindings(path, scripts) {
  return Object.entries(scripts ?? {}).flatMap(([name, command]) =>
    retryFlag.test(command) ? [`${path}: script "${name}" must not pass --retry`] : [],
  );
}

function selfTest() {
  const cases = [
    [heapFindings("x", 'NODE_OPTIONS="--max-old-space-size=8192"').length, 1],
    [heapFindings("x", "node --max_old_space_size=4096 build.js").length, 1],
    [heapFindings("x", "tsup && pnpm postbuild").length, 0],
    [vitestFindings("x", "test: { retry: 0 }").length, 0],
    [vitestFindings("x", "test: { retry: 2 }").length, 2],
    [vitestFindings("x", "test: {}").length, 1],
    [scriptFindings("x", { test: "vitest run --retry=3" }).length, 1],
    [scriptFindings("x", { test: "vitest run" }).length, 0],
  ];
  const failed = cases.filter(([actual, expected]) => actual !== expected);
  if (failed.length > 0) {
    console.error(`Policy self-test failed: ${failed.length} of ${cases.length} cases`);
    process.exit(1);
  }
  console.log(`Policy self-test passed: ${cases.length} cases`);
}

function check() {
  const self = "scripts/check-ci-policy.mjs";
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter((path) => path && path !== self && !path.endsWith(".md") && existsSync(path));

  const failures = [];
  for (const path of tracked) {
    failures.push(...heapFindings(path, readFileSync(path, "utf8")));
  }

  const manifests = tracked.filter((path) => /(^|\/)package\.json$/.test(path));
  for (const path of manifests) {
    failures.push(...scriptFindings(path, JSON.parse(readFileSync(path, "utf8")).scripts));
  }

  const packages = manifests
    .filter((path) => path.startsWith("packages/"))
    .map((path) => path.slice(0, -"/package.json".length));
  for (const dir of packages) {
    const config = ["ts", "mts", "js", "mjs"]
      .map((ext) => `${dir}/vitest.config.${ext}`)
      .find((path) => existsSync(path));
    if (!config) {
      failures.push(`${dir}: a Vitest config with retry: 0 is required`);
      continue;
    }
    failures.push(...vitestFindings(config, readFileSync(config, "utf8")));
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    `CI policy passed: ${tracked.length} tracked files, ${packages.length} Vitest configs with retry: 0`,
  );
}

if (process.argv.includes("--self-test")) selfTest();
else check();
