#!/usr/bin/env node
// PLAN P0 row 3 artifact inspector (TDD packaging PKG-004/PKG-005).
// Packs both packages with `pnpm pack`, extracts each tarball, and rejects:
// `workspace:` ranges, wildcard or non-relative export targets, missing export
// targets, a missing license, files not reachable from a declared export, and
// source maps that leak absolute paths. Writes a JSON report with digests.
//
//   node scripts/inspect-packages.mjs --out <dir>   pack, inspect, report
//   node scripts/inspect-packages.mjs --self-test   prove each rule rejects

import { execFileSync, execSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { packageDirs } from "./package-entries.mjs";

const DEPENDENCY_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];
const ALWAYS_PACKED = /^(package\.json|README(\.md)?|LICENSE(\.md|\.txt)?)$/i;

/** Every string target in an `exports` value. */
function targets(value) {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(targets);
  return [];
}

/** Relative module/style references in a packed text file. */
export function references(file, text) {
  const refs = [];
  const patterns = file.endsWith(".css")
    ? [/@import\s+["']([^"']+)["']/g, /url\(\s*["']?([^"')\s]+)["']?\s*\)/g]
    : [
        /\bfrom\s*["']([^"']+)["']/g,
        /\bimport\s*["']([^"']+)["']/g,
        /\bimport\(\s*["']([^"']+)["']\s*\)/g,
      ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[1].startsWith(".")) refs.push(match[1]);
    }
  }
  // A source-map URL is relative to the file even without a leading "./".
  for (const match of text.matchAll(/sourceMappingURL=([^\s*]+)/g)) {
    if (!/^(data|https?|file):/.test(match[1])) refs.push(match[1].startsWith(".") ? match[1] : `./${match[1]}`);
  }
  return refs;
}

function resolveReference(from, ref, files) {
  const base = path.posix.join(path.posix.dirname(from), ref);
  const candidates = [base, `${base}.js`, `${base}.d.ts`, `${base}/index.js`, `${base}/index.d.ts`];
  if (base.endsWith(".js")) candidates.push(base.replace(/\.js$/, ".d.ts"));
  return candidates.find((candidate) => files.has(candidate));
}

/**
 * Inspect one extracted package.
 * @param {object} manifest packed package.json
 * @param {Set<string>} files packed file paths, POSIX, relative to the package root
 * @param {(file: string) => string} read reads a packed text file
 * @returns {string[]} failures
 */
export function inspectPackage(manifest, files, read) {
  const failures = [];
  const name = manifest.name ?? "<unnamed>";

  for (const field of DEPENDENCY_FIELDS) {
    for (const [dep, range] of Object.entries(manifest[field] ?? {})) {
      if (String(range).startsWith("workspace:")) failures.push(`${name}: ${field}.${dep} is "${range}"`);
    }
  }

  if (!manifest.license) failures.push(`${name}: package.json has no license`);
  if (![...files].some((file) => /^LICENSE(\.md|\.txt)?$/i.test(file))) failures.push(`${name}: no LICENSE file`);

  const exportsField = manifest.exports;
  if (!exportsField || typeof exportsField !== "object" || Object.keys(exportsField).length === 0) {
    failures.push(`${name}: exports must be a non-empty explicit map`);
    return failures;
  }

  const reachable = new Set();
  const queue = [];
  for (const [subpath, value] of Object.entries(exportsField)) {
    if (subpath.includes("*")) failures.push(`${name}: wildcard export "${subpath}"`);
    if (subpath !== "." && !subpath.startsWith("./")) failures.push(`${name}: export key "${subpath}" is not relative`);
    for (const target of targets(value)) {
      if (target.includes("*")) {
        failures.push(`${name}: wildcard target "${target}" for "${subpath}"`);
        continue;
      }
      const normalized = path.posix.normalize(target);
      if (!target.startsWith("./") || normalized.startsWith("..") || path.posix.isAbsolute(normalized)) {
        failures.push(`${name}: target "${target}" for "${subpath}" leaves the package`);
        continue;
      }
      if (!files.has(normalized)) {
        failures.push(`${name}: "${subpath}" -> "${target}" is not in the tarball`);
        continue;
      }
      queue.push(normalized);
    }
    if (typeof value === "object" && value && targets(value).some((t) => t.endsWith(".js")) && !value.types) {
      failures.push(`${name}: "${subpath}" has JavaScript but no types target`);
    }
  }

  while (queue.length > 0) {
    const file = queue.pop();
    if (reachable.has(file)) continue;
    reachable.add(file);
    if (!/\.(js|d\.ts|css)$/.test(file)) continue;
    for (const ref of references(file, read(file))) {
      const resolved = resolveReference(file, ref, files);
      if (resolved) queue.push(resolved);
      else if (!ref.endsWith(".map")) failures.push(`${name}: ${file} references missing "${ref}"`);
    }
  }

  for (const file of files) {
    if (file.endsWith(".map")) {
      if (!reachable.has(file)) failures.push(`${name}: undeclared file ${file}`);
      const map = JSON.parse(read(file));
      for (const source of map.sources ?? []) {
        if (path.isAbsolute(source) || /^[a-zA-Z]:[\\/]/.test(source) || source.startsWith("file:")) {
          failures.push(`${name}: ${file} leaks absolute source path "${source}"`);
        }
      }
      continue;
    }
    if (!reachable.has(file) && !ALWAYS_PACKED.test(file)) failures.push(`${name}: undeclared file ${file}`);
    if (file.startsWith("src/")) failures.push(`${name}: source file ${file} is packed`);
  }

  return failures;
}

function selfTest() {
  const good = {
    name: "fixture",
    license: "UNLICENSED",
    peerDependencies: { react: "^19.0.0" },
    exports: { "./a": { types: "./dist/a.d.ts", default: "./dist/a.js" }, "./package.json": "./package.json" },
  };
  const goodFiles = {
    "package.json": "{}",
    LICENSE: "x",
    "dist/a.js": 'export * from "./chunk.js";\n//# sourceMappingURL=a.js.map',
    "dist/a.js.map": '{"sources":["../src/a.ts"]}',
    "dist/a.d.ts": "export {};",
    "dist/chunk.js": "export const a = 1;",
  };
  const { LICENSE: _license, ...withoutLicenseFile } = goodFiles;
  const { "dist/chunk.js": _chunk, ...withoutChunk } = goodFiles;
  const run = (manifest, files) =>
    inspectPackage(manifest, new Set(Object.keys(files)), (file) => files[file]);
  // [label, failures, expected message fragment; null means no failures]
  const cases = [
    ["valid package", run(good, goodFiles), null],
    ["workspace: range", run({ ...good, peerDependencies: { x: "workspace:^" } }, goodFiles), '"workspace:^"'],
    ["wildcard export", run({ ...good, exports: { ...good.exports, "./*": "./dist/*.js" } }, goodFiles), "wildcard export"],
    ["missing types", run({ ...good, exports: { ...good.exports, "./a": { default: "./dist/a.js" } } }, goodFiles), "no types target"],
    ["missing target", run({ ...good, exports: { ...good.exports, "./b": "./dist/b.js" } }, goodFiles), "is not in the tarball"],
    ["path traversal", run({ ...good, exports: { ...good.exports, "./x": "./../x.js" } }, goodFiles), "leaves the package"],
    ["missing license field", run({ ...good, license: undefined }, goodFiles), "has no license"],
    ["missing LICENSE file", run(good, withoutLicenseFile), "no LICENSE file"],
    ["undeclared file", run(good, { ...goodFiles, "dist/extra.css": "a{}" }), "undeclared file dist/extra.css"],
    ["packed source", run(good, { ...goodFiles, "src/a.ts": "" }), "source file src/a.ts"],
    ["absolute source-map path", run(good, { ...goodFiles, "dist/a.js.map": '{"sources":["C:/Users/me/a.ts"]}' }), "leaks absolute source path"],
    ["missing chunk", run(good, withoutChunk), 'references missing "./chunk.js"'],
    [
      "missing font behind a stylesheet url()",
      run(
        { ...good, exports: { ...good.exports, "./theme.css": "./dist/theme.css" } },
        { ...goodFiles, "dist/theme.css": '@font-face { src: url("../fonts/a.woff2") format("woff2"); }' },
      ),
      'references missing "../fonts/a.woff2"',
    ],
  ];

  const failed = cases.filter(([, failures, expected]) =>
    expected === null ? failures.length > 0 : !failures.some((failure) => failure.includes(expected)),
  );
  for (const [label, failures, expected] of failed) {
    console.error(`${label}: expected ${expected ?? "no failures"}, got:\n  ${failures.join("\n  ") || "(none)"}`);
  }
  if (failed.length > 0) process.exit(1);
  console.log(`Inspector self-test passed: ${cases.length} cases`);
}

function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function listFiles(root) {
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
}

function packAndInspect(outDir) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const report = { schemaVersion: 1, packages: [] };
  const failures = [];

  for (const dir of packageDirs) {
    const before = new Set(fs.readdirSync(outDir));
    // A command string runs through the shell, which resolves pnpm.cmd on Windows.
    execSync(`pnpm pack --pack-destination ${JSON.stringify(outDir)}`, {
      cwd: path.resolve(dir),
      stdio: ["ignore", "ignore", "inherit"],
    });
    const tarball = fs.readdirSync(outDir).find((file) => file.endsWith(".tgz") && !before.has(file));
    if (!tarball) throw new Error(`pnpm pack produced no tarball for ${dir}`);
    const tarballPath = path.join(outDir, tarball);

    const extractDir = path.join(outDir, tarball.replace(/\.tgz$/, ""));
    fs.mkdirSync(extractDir);
    execFileSync("tar", ["-xzf", tarball, "-C", path.basename(extractDir)], { cwd: outDir });
    const root = path.join(extractDir, "package");
    const files = new Set(listFiles(root));
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    failures.push(...inspectPackage(manifest, files, (file) => fs.readFileSync(path.join(root, file), "utf8")));

    report.packages.push({
      name: manifest.name,
      version: manifest.version,
      tarball,
      tarballSha256: sha256(tarballPath),
      manifestSha256: sha256(path.join(root, "package.json")),
      fileCount: files.size,
      exports: Object.keys(manifest.exports ?? {}),
      peerDependencies: manifest.peerDependencies ?? {},
    });
  }

  fs.writeFileSync(path.join(outDir, "pack-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  for (const pkg of report.packages) {
    console.log(`${pkg.name}@${pkg.version}: ${pkg.exports.length} exports, ${pkg.fileCount} files, sha256 ${pkg.tarballSha256}`);
  }
  console.log(`Artifact inspection passed; report: ${path.join(outDir, "pack-report.json")}`);
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const outIndex = process.argv.indexOf("--out");
  packAndInspect(path.resolve(outIndex > -1 ? process.argv[outIndex + 1] : "artifacts/packages"));
}
