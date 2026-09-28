#!/usr/bin/env node
// Documentation gates for the UI Platform repository.
//
// 1. Link check: every relative Markdown link in the governing documents
//    resolves to a tracked file, and every `#anchor` resolves to a heading.
// 2. Acceptance audit: every P0 row in PLAN.md names a defined role and a
//    binary acceptance condition without hedging vocabulary, and every
//    decision in the register carries its required fields.
//
// Historical inherited notes under `packages/**` are excluded from the link
// check (README.md marks them as historical source material).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const root = process.cwd();
const failures = [];

const tracked = execFileSync("git", ["ls-files", "*.md"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => !file.startsWith("packages/"));

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

// 1. Link check
const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const file of tracked) {
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

// 2. Acceptance audit
const vague =
  /\b(reported|known|representative|profiled|where support is claimed|as needed|if possible|should|recommended)\b/i;

const sot = readFileSync("docs/ARCHITECTURE_SOT.md", "utf8");
const rolesSection = sot.split(/^## Roles$/m)[1]?.split(/^## /m)[0] ?? "";
const roles = new Set(
  [...rolesSection.matchAll(/^\|\s*([A-Z][A-Za-z ]+Lead)\s*\|/gm)].map((m) =>
    m[1].trim(),
  ),
);
if (roles.size === 0)
  failures.push("docs/ARCHITECTURE_SOT.md: no roles table found");

const plan = readFileSync("PLAN.md", "utf8");
const p0 =
  plan
    .split(/^## P0: release-blocking evidence and repair$/m)[1]
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
if (rows.length === 0) failures.push("PLAN.md: no P0 rows found");
rows.forEach(([order, owner, work, acceptance], index) => {
  if (Number(order) !== index)
    failures.push(
      `PLAN.md: P0 row ${order} is out of order (expected ${index})`,
    );
  if (!roles.has(owner))
    failures.push(
      `PLAN.md: P0 row ${order} owner "${owner}" is not a role in the SOT`,
    );
  if (!work) failures.push(`PLAN.md: P0 row ${order} has no work description`);
  if (!acceptance)
    failures.push(`PLAN.md: P0 row ${order} has no acceptance condition`);
  else if (vague.test(acceptance)) {
    failures.push(
      `PLAN.md: P0 row ${order} acceptance uses non-binary wording "${acceptance.match(vague)[0]}"`,
    );
  }
});

const register = readFileSync("docs/architecture/DECISION_REGISTER.md", "utf8");
const decisions = register.split(/^### /m).slice(1);
const ids = decisions.map((section) => section.split(" ")[0]);
const expected = Array.from({ length: 7 }, (_, i) => `UIP-DEC-00${i + 1}`);
if (ids.join() !== expected.join()) {
  failures.push(
    `DECISION_REGISTER.md: decisions are ${ids.join(", ")}; expected ${expected.join(", ")}`,
  );
}
for (const section of decisions) {
  const id = section.split(" ")[0];
  for (const field of ["**Owner:**", "**Position:**", "**Evidence"]) {
    if (!section.includes(field))
      failures.push(`DECISION_REGISTER.md: ${id} lacks ${field}`);
  }
  const owner = /\*\*Owner:\*\*\s*([A-Za-z ]+Lead)/.exec(section)?.[1];
  if (owner && !roles.has(owner))
    failures.push(
      `DECISION_REGISTER.md: ${id} owner "${owner}" is not a role in the SOT`,
    );
}

for (const file of tracked) {
  if (/\bnpm pack\b/.test(readFileSync(file, "utf8"))) {
    failures.push(
      `${file}: uses "npm pack"; the release harness uses "pnpm pack"`,
    );
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join("\n"));
  console.error(`\n${failures.length} documentation gate failure(s).`);
  process.exit(1);
}
console.log(
  `Documentation gates passed: ${tracked.length} files link-checked, ${rows.length} P0 rows and ${decisions.length} decisions audited.`,
);
