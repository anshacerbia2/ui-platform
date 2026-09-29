#!/usr/bin/env node
// Token gate (PLAN P0 row 4; TDD tokens). Normalizes the Sass token source,
// validates it, and writes a JSON report.
//
//   node scripts/tokens/check.mjs [--report <file>] [--blocking] [--block <category,...>]
//
// Report mode (default) exits 0 with findings; --blocking exits 1 on any
// finding; --block exits 1 on findings in the named categories, so categories
// that are already clean cannot regress while the rest are fixed.
// Configuration or normalization errors always exit 1.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STANDARD, parseTokenName, tokenType } from "./grammar.mjs";
import { normalize } from "./normalize.mjs";
import { CATEGORIES, callsiteFindings, validate } from "./validate.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const CONFIG_KEYS = {
  root: ["schemaVersion", "sourceRoot", "themes", "fonts", "contrast", "aliases"],
  theme: ["inherits", "modes"],
  mode: ["module", "variable"],
  fonts: ["system", "assets"],
  asset: ["files", "license"],
  contrast: ["textMinimum", "nonTextMinimum", "canvas", "neutralBackgrounds"],
};

/** Load tokens.config.json; unknown keys fail (TDD tokens, Configuration). */
export function loadConfig(file) {
  const config = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = [];
  const known = (object, keys, where) => {
    for (const key of Object.keys(object ?? {})) {
      if (!keys.includes(key)) errors.push(`${where}: unknown key "${key}"`);
    }
  };
  known(config, CONFIG_KEYS.root, "config");
  if (config.schemaVersion !== 1) errors.push("config: schemaVersion must be 1");
  for (const [id, theme] of Object.entries(config.themes ?? {})) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(`themes.${id}: theme ID must be URL-safe`);
    known(theme, CONFIG_KEYS.theme, `themes.${id}`);
    if (theme.inherits && !config.themes[theme.inherits]) errors.push(`themes.${id}: unknown parent "${theme.inherits}"`);
    for (const [mode, source] of Object.entries(theme.modes ?? {})) {
      if (!["light", "dark"].includes(mode)) errors.push(`themes.${id}.modes: unknown mode "${mode}"`);
      known(source, CONFIG_KEYS.mode, `themes.${id}.modes.${mode}`);
    }
  }
  known(config.fonts, CONFIG_KEYS.fonts, "fonts");
  for (const [family, asset] of Object.entries(config.fonts?.assets ?? {})) known(asset, CONFIG_KEYS.asset, `fonts.assets.${family}`);
  known(config.contrast, CONFIG_KEYS.contrast, "contrast");
  if (errors.length > 0) throw new Error(`Invalid token configuration:\n${errors.join("\n")}`);
  return config;
}

function canonicalJson(themes) {
  const plain = {};
  for (const [themeId, modes] of Object.entries(themes)) {
    plain[themeId] = {};
    for (const [mode, { records }] of Object.entries(modes)) {
      plain[themeId][mode] = Object.fromEntries([...records.entries()].sort(([a], [b]) => a.localeCompare(b)));
    }
  }
  return JSON.stringify(plain);
}

// Token consumers: component styles and code, base styles, the Sass consumer
// API, the Panda config, and core-ui (which must not reference design tokens).
// Token definition sources are not callsites.
const CALLSITE_ROOTS = [
  "src/components",
  "src/styles/base",
  "src/styles/abstracts/_variables.scss",
  "src/styles/abstracts/_mixins.scss",
  "panda.config.ts",
  "../core-ui/src",
];

function callsiteFiles() {
  const files = [];
  const visit = (target) => {
    if (!fs.existsSync(target)) return;
    if (fs.statSync(target).isDirectory()) {
      for (const entry of fs.readdirSync(target)) visit(path.join(target, entry));
    } else if (/\.(s?css|tsx?|mjs)$/.test(target)) {
      files.push(target);
    }
  };
  for (const root of CALLSITE_ROOTS) visit(path.join(packageDir, root));
  return files;
}

function sourceSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: packageDir, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const blocking = args.includes("--blocking");
  const reportIndex = args.indexOf("--report");
  const reportFile = reportIndex > -1 ? path.resolve(args[reportIndex + 1]) : null;
  const blockIndex = args.indexOf("--block");
  const blocked = blockIndex > -1 ? args[blockIndex + 1].split(",") : [];
  for (const category of blocked) {
    if (!CATEGORIES.includes(category)) throw new Error(`--block: unknown category "${category}"`);
  }

  const started = performance.now();
  const config = loadConfig(path.join(packageDir, "tokens.config.json"));
  const { themes } = normalize({ packageDir, config });
  const { findings, stats } = validate({ themes, config, packageDir });

  const aliases = config.aliases ?? {};
  const names = new Set(Object.values(themes).flatMap((modes) => Object.values(modes).flatMap(({ records }) => [...records.keys()])));
  const callsites = callsiteFindings(callsiteFiles(), names, packageDir);
  findings.push(...callsites);
  const byTier = {};
  const byType = {};
  for (const name of names) {
    const parsed = parseTokenName(name, aliases);
    const tier = parsed.valid ? `tier${parsed.tier}` : "noncanonical";
    byTier[tier] = (byTier[tier] ?? 0) + 1;
    const type = tokenType(name, aliases) ?? "untyped";
    byType[type] = (byType[type] ?? 0) + 1;
  }
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, findings.filter((f) => f.category === category).length]));

  const report = {
    schemaVersion: 1,
    standard: STANDARD,
    sourceSha: sourceSha(),
    normalizedRootHash: createHash("sha256").update(canonicalJson(themes)).digest("hex"),
    mode: blocking ? "blocking" : "report",
    blockedCategories: blocking ? CATEGORIES : blocked,
    durationMs: Math.round(performance.now() - started),
    records: { names: names.size, byTier, byType },
    themes: Object.fromEntries(Object.entries(themes).map(([id, modes]) => [id, Object.fromEntries(Object.entries(modes).map(([mode, { records }]) => [mode, records.size]))])),
    aliasCount: Object.keys(aliases).length,
    unresolvedReferences: stats.unresolved,
    undefinedCallsites: callsites.length,
    contrast: { cases: stats.contrastCases, failures: stats.contrastFailures },
    colorsOutsideSrgb: stats.outOfGamut,
    findingsByCategory: byCategory,
    findings,
  };

  if (reportFile) {
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(`Token gate (${report.mode}) against ${STANDARD.id} ${STANDARD.version}`);
  console.log(`  ${names.size} token names; themes ${Object.entries(report.themes).map(([id, m]) => `${id} ${Object.entries(m).map(([k, v]) => `${k}:${v}`).join("/")}`).join(", ")}`);
  console.log(`  tiers ${JSON.stringify(byTier)}; contrast cases ${stats.contrastCases}; colors outside sRGB ${stats.outOfGamut}`);
  for (const category of CATEGORIES) {
    const gate = blocking || blocked.includes(category) ? "blocking" : "report";
    console.log(`  ${category.padEnd(15)} ${String(byCategory[category]).padStart(4)} finding(s)  [${gate}]`);
  }
  if (reportFile) console.log(`  report: ${reportFile}`);

  if (blocking && findings.length > 0) process.exit(1);
  const failedBlocked = blocked.filter((category) => byCategory[category] > 0);
  if (failedBlocked.length > 0) {
    for (const finding of findings.filter((f) => failedBlocked.includes(f.category)).slice(0, 20)) {
      console.error(`  ${finding.category}: ${finding.token}${finding.theme ? ` [${finding.theme}/${finding.mode}]` : ""} ${finding.message}`);
    }
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
