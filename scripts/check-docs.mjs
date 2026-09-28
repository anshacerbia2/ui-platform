#!/usr/bin/env node
// Enforce the deliberately small UI Platform documentation boundary:
// README + PLAN + ROADMAP, exactly five TDDs, and review records split by round.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const root = process.cwd();
const failures = [];

const tdds = [
  "docs/designs/TDD-ui-platform-packaging-001-build-and-package-contract.md",
  "docs/designs/TDD-ui-platform-primitives-002-behavior-and-polymorphism.md",
  "docs/designs/TDD-ui-platform-styled-004-component-css-delivery.md",
  "docs/designs/TDD-ui-platform-theme-005-provider-and-transitions.md",
  "docs/designs/TDD-ui-platform-tokens-003-theme-and-token-output.md",
];
const reviews = [
  "docs/reviews/2026-09-29-round-3.md",
  "docs/reviews/2026-09-29-counter-review.md",
  "docs/reviews/2026-09-29-design-maturity.md",
  "docs/reviews/2026-09-29-ratification-readiness.md",
];
const governing = ["README.md", "PLAN.md", "ROADMAP.md", ...tdds, ...reviews];

function markdownBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownBelow(path);
    return entry.name.endsWith(".md") ? [path.replaceAll("\\", "/")] : [];
  });
}

const actualDocs = markdownBelow("docs").sort();
const expectedDocs = [...tdds, ...reviews].sort();
if (actualDocs.join("\n") !== expectedDocs.join("\n")) {
  failures.push(
    `docs/: expected only five TDDs and review records split by round; found ${actualDocs.join(", ")}`,
  );
}

for (const file of governing) {
  if (!existsSync(file) || !statSync(file).isFile()) {
    failures.push(`${file}: required governing document is missing`);
  }
}

function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

const anchorCache = new Map();
function anchorsOf(file) {
  if (!anchorCache.has(file)) {
    const seen = new Map();
    const anchors = new Set();
    let inFence = false;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      if (/^\s*```/.test(line)) inFence = !inFence;
      const match = !inFence && /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
      if (!match) continue;
      const base = slug(match[1]);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
    anchorCache.set(file, anchors);
  }
  return anchorCache.get(file);
}

const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const file of governing.filter(existsSync)) {
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const [, target] of text.matchAll(linkPattern)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(target)) continue;
    const [pathPart, anchor] = target.split("#");
    const resolved = pathPart
      ? normalize(join(dirname(file), decodeURIComponent(pathPart)))
      : file;
    if (!existsSync(join(root, resolved))) {
      failures.push(`${file}: broken link to ${target}`);
      continue;
    }
    if (
      anchor &&
      resolved.endsWith(".md") &&
      !anchorsOf(resolved).has(anchor)
    ) {
      failures.push(
        `${file}: missing anchor #${anchor} in ${relative(root, resolved)}`,
      );
    }
  }
}

const plan = readFileSync("PLAN.md", "utf8");
const p0 =
  plan
    .split(/^## P0 — release-blocking repair and evidence$/m)[1]
    ?.split(/^## /m)[0] ?? "";
const rows = p0
  .split(/\r?\n/)
  .filter((line) => /^\|\s*\d+\s*\|/.test(line))
  .map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );
if (rows.length !== 12)
  failures.push(`PLAN.md: expected 12 P0 rows; found ${rows.length}`);
const vague = /\b(as needed|if possible|should|recommended)\b/i;
rows.forEach(([order, owner, work, acceptance], index) => {
  if (Number(order) !== index)
    failures.push(`PLAN.md: row ${order} expected order ${index}`);
  if (!/^[A-Z][A-Za-z ]+ Lead$/.test(owner))
    failures.push(`PLAN.md: row ${order} has invalid owner "${owner}"`);
  if (!work) failures.push(`PLAN.md: row ${order} has no work`);
  if (!acceptance) failures.push(`PLAN.md: row ${order} has no acceptance`);
  else if (vague.test(acceptance))
    failures.push(`PLAN.md: row ${order} has non-binary acceptance wording`);
});

const requiredSections = [
  "Purpose",
  "Scope",
  "Technical Context",
  "Component Design",
  "Data Model",
  "API / Interface",
  "Algorithms / Logic",
  "Configuration",
  "Testing Strategy",
  "Performance Notes",
  "Security Notes",
  "Operational Notes",
  "Failure Handling",
  "Observability",
  "Rollout and Compatibility",
  "Open Questions",
  "Traceability",
];
const expectedIds = [
  "TDD-ui-platform-packaging-001",
  "TDD-ui-platform-primitives-002",
  "TDD-ui-platform-styled-004",
  "TDD-ui-platform-theme-005",
  "TDD-ui-platform-tokens-003",
];
tdds.forEach((file, index) => {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  const id = /^\s*id:\s*(\S+)\s*$/m.exec(text)?.[1];
  if (id !== expectedIds[index])
    failures.push(`${file}: id is ${id}; expected ${expectedIds[index]}`);
  if (!/^\s*status:\s*proposed\s*$/m.test(text))
    failures.push(`${file}: lifecycle status must remain proposed`);
  if (!/^\s*version:\s*1\.0\.0\s*$/m.test(text))
    failures.push(
      `${file}: implementation-ready baseline must be version 1.0.0`,
    );
  if (!/^\s*parent_sad:\s*SAD-003\s*$/m.test(text))
    failures.push(`${file}: parent_sad must be SAD-003`);
  for (const section of requiredSections) {
    if (!text.includes(`## ${section}`))
      failures.push(`${file}: missing section ${section}`);
  }
  if (!/^\|\s*[A-Z]{3}-\d{3}\s*\|/m.test(text))
    failures.push(`${file}: must define traceable requirement IDs`);
  if (!/```(?:mermaid|ts|text)/.test(text))
    failures.push(
      `${file}: must contain an executable design model or contract`,
    );
  if (/\b(?:TODO|TBD|fill this|coming soon)\b/i.test(text))
    failures.push(`${file}: contains an unresolved placeholder`);
  if (!text.includes("Architecture authority:"))
    failures.push(
      `${file}: traceability must name central architecture authority`,
    );
  if (!text.includes("[PLAN](../../PLAN.md)"))
    failures.push(`${file}: traceability must link to PLAN`);
  if (
    /UIP-DEC-|DECISION_REGISTER|ARCHITECTURE_SOT|RATIFICATION_MANIFEST/.test(
      text,
    )
  ) {
    failures.push(
      `${file}: references a removed duplicate-authority document or local decision ID`,
    );
  }
});

for (const review of reviews.filter(existsSync)) {
  const reviewText = readFileSync(review, "utf8");
  if (!/audit record; non-normative/i.test(reviewText)) {
    failures.push(`${review}: must state its non-normative authority boundary`);
  }
  if ((reviewText.match(/^## .*review disposition$/gim) ?? []).length > 1) {
    failures.push(`${review}: must contain only one review-round disposition`);
  }
}

for (const file of governing.filter(existsSync)) {
  if (/\bnpm pack\b/.test(readFileSync(file, "utf8"))) {
    failures.push(`${file}: uses npm pack; use pnpm pack`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  console.error(`\n${failures.length} documentation gate failure(s).`);
  process.exit(1);
}

console.log(
  `Documentation boundary passed: ${tdds.length} TDDs, ${rows.length} P0 rows, one roadmap, and ${reviews.length} principal-review records.`,
);
