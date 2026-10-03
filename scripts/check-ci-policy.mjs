#!/usr/bin/env node
// PLAN P0 row 2 policy gate:
// - no tracked configuration raises or sets the Node/V8 heap (builds must pass
//   with the default heap of the pinned runner);
// - every package Vitest config sets `retry: 0`, and no script passes `--retry`;
// - line endings (TDD packaging V4): every vendored file verified by SHA-256
//   is exempt from end-of-line conversion (`-text`), and every other tracked
//   file checks out with LF on every platform (`eol=lf`);
// - support matrix (TDD packaging RC5): the pinned Node.js is a supported line,
//   the CI workflow runs the packed consumer on every other line, and it
//   installs every browser engine the matrix lists.
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

/**
 * Line-ending findings from `git check-attr text eol` output.
 * @param {Map<string, { text?: string, eol?: string }>} attrs path -> attributes
 * @param {Set<string>} verified paths whose bytes are checked against a digest
 */
export function lineEndingFindings(attrs, verified) {
  const findings = [];
  for (const [path, { text, eol }] of attrs) {
    if (verified.has(path)) {
      if (text !== "unset") findings.push(`${path}: a digest-verified file needs -text in .gitattributes (text is ${text})`);
    } else if (eol !== "lf") findings.push(`${path}: must check out with LF (eol is ${eol})`);
  }
  for (const path of verified) if (!attrs.has(path)) findings.push(`${path}: digest-verified file is not tracked`);
  return findings;
}

/** Parse `git check-attr` lines (`path: attribute: value`). */
export function parseCheckAttr(output) {
  const attrs = new Map();
  for (const line of output.split("\n").filter(Boolean)) {
    const match = /^(.*): (text|eol): (.*)$/.exec(line);
    if (!match) continue;
    const entry = attrs.get(match[1]) ?? {};
    entry[match[2]] = match[3];
    attrs.set(match[1], entry);
  }
  return attrs;
}

/** Supported Node.js lines the CI workflow does not exercise. */
export function nodeLineFindings(matrixLines, pinned, workflow) {
  const findings = [];
  const pinnedLine = pinned.trim().split(".")[0];
  if (!matrixLines.includes(pinnedLine)) findings.push(`.node-version ${pinned.trim()} is not a supported line (${matrixLines.join(", ")})`);
  for (const line of matrixLines) {
    if (line === pinnedLine) continue;
    const step = new RegExp(`node-version: "${line}"\\s*\\n\\s*- name: [^\\n]*\\n\\s*run: node scripts/packed-consumer\\.mjs`);
    if (!step.test(workflow)) findings.push(`.github/workflows/ci.yml does not run the packed consumer on Node.js ${line}`);
  }
  return findings;
}

/** Browser engines in the matrix that the packed-consumer job does not install. */
export function browserInstallFindings(engines, workflow) {
  const install = /playwright install --with-deps ([a-z ]+)\n/.exec(workflow)?.[1].trim().split(/\s+/) ?? [];
  return engines.filter((engine) => !install.includes(engine)).map((engine) => `.github/workflows/ci.yml does not install the ${engine} browser engine`);
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
    [lineEndingFindings(parseCheckAttr("a.json: text: unset\na.json: eol: lf\nb.md: text: auto\nb.md: eol: lf\n"), new Set(["a.json"])).length, 0],
    [lineEndingFindings(parseCheckAttr("a.json: text: auto\na.json: eol: lf\n"), new Set(["a.json"])).length, 1],
    [lineEndingFindings(parseCheckAttr("b.md: text: unspecified\nb.md: eol: unspecified\n"), new Set()).length, 1],
    [lineEndingFindings(parseCheckAttr(""), new Set(["a.json"])).length, 1],
    [nodeLineFindings(["22", "24"], "24.11.1\n", '        with:\n          node-version: "22"\n      - name: x\n        run: node scripts/packed-consumer.mjs --packs a').length, 0],
    [nodeLineFindings(["22", "24"], "24.11.1\n", "").length, 1],
    [nodeLineFindings(["22"], "24.11.1\n", "").length, 2],
    [browserInstallFindings(["chromium", "firefox"], "run: pnpm exec playwright install --with-deps chromium firefox\n").length, 0],
    [browserInstallFindings(["chromium", "webkit"], "run: pnpm exec playwright install --with-deps chromium\n").length, 1],
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
  const all = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const tracked = all.filter((path) => path !== self && !path.endsWith(".md") && existsSync(path));

  const failures = [];
  const schemaDir = "scripts/sbom/schema";
  const verified = new Set(Object.keys(JSON.parse(readFileSync(`${schemaDir}/provenance.json`, "utf8")).files).map((file) => `${schemaDir}/${file}`));
  const attrs = parseCheckAttr(execFileSync("git", ["check-attr", "text", "eol", "--", ...all], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
  failures.push(...lineEndingFindings(attrs, verified));
  const matrix = JSON.parse(readFileSync("support-matrix.json", "utf8"));
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  failures.push(...nodeLineFindings(matrix.node, readFileSync(".node-version", "utf8"), workflow));
  failures.push(...browserInstallFindings(matrix.browsers, workflow));
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
  // The component workshop's story tests (ADR-UIP-WKS-001) run from the root.
  const workshop = "vitest.storybook.config.ts";
  if (existsSync(workshop)) failures.push(...vitestFindings(workshop, readFileSync(workshop, "utf8")));
  const configs = packages.length + (existsSync(workshop) ? 1 : 0);

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    `CI policy passed: ${tracked.length} tracked files, ${configs} Vitest configs with retry: 0, ${verified.size} digest-verified files without line-ending conversion, every other file LF`,
  );
}

if (process.argv.includes("--self-test")) selfTest();
else check();
