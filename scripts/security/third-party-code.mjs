// TDD packaging V7: third-party code compiled into a tarball. A package that
// ships such code declares it in `third-party-code.json` (name, version,
// license, and the package-relative source prefix it occupies). The published
// sourcemaps say which sources each tarball contains:
// - a source under node_modules is a bundled dependency, which no package may
//   ship (dependencies stay external, TDD packaging K2);
// - a source git does not track is generated, and must fall under a record;
// - every record must match a shipped source and the installed version;
// - the packed LICENSE must name each component and carry its license text
//   verbatim (the MIT condition: "The above copyright notice and this
//   permission notice shall be included in all copies or substantial portions
//   of the Software").

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** The package's third-party code record, or an empty one. */
export function thirdPartyCode(packageDir) {
  const file = path.join(packageDir, "third-party-code.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { components: [] };
}

/** Package-relative paths of every source named by the sourcemaps under `distDir`. */
export function sourcemapSources(distDir, packageRoot) {
  const sources = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".js.map")) {
        for (const source of JSON.parse(fs.readFileSync(file, "utf8")).sources) sources.add(path.relative(packageRoot, path.resolve(path.dirname(file), source)).replaceAll("\\", "/"));
      }
    }
  };
  walk(distDir);
  return sources;
}

/** The installed copy of `name@version` in the workspace's pnpm virtual store, or null. */
export function installedPackageDir(workspaceRoot, name, version) {
  const dir = path.join(workspaceRoot, "node_modules", ".pnpm");
  const prefix = `${name.replace("/", "+")}@${version}`;
  const entry = fs.existsSync(dir) ? fs.readdirSync(dir).find((e) => e === prefix || e.startsWith(`${prefix}_`)) : undefined;
  return entry ? path.join(dir, entry, "node_modules", name) : null;
}

const normalize = (text) => text.replace(/\s+/g, " ").trim();

/**
 * Problems with the third-party code one packed package ships.
 * @param {object} options
 * @param {string} options.name package name, for messages
 * @param {Set<string>} options.sources package-relative sourcemap sources
 * @param {Set<string>} options.tracked package-relative paths git tracks
 * @param {{ components: { name: string, version: string, sources: string }[] }} options.record
 * @param {string} options.license text of the packed LICENSE
 * @param {(component: object) => { version: string, licenseText: string } | null} options.installed
 */
export function thirdPartyCodeProblems({ name, sources, tracked, record, license, installed }) {
  const problems = [];
  for (const source of sources) {
    if (source.split("/").includes("node_modules")) problems.push(`${name}: bundles a dependency source ${source}`);
    else if (!tracked.has(source) && !record.components.some((c) => source.startsWith(c.sources))) problems.push(`${name}: generated source ${source} has no third-party code record`);
  }
  for (const component of record.components) {
    const id = `${component.name}@${component.version}`;
    if (![...sources].some((source) => source.startsWith(component.sources))) problems.push(`${name}: ${id} is recorded but no shipped source is under ${component.sources}`);
    const copy = installed(component);
    if (!copy) problems.push(`${name}: ${id} is not installed; the record does not match the lockfile`);
    else if (!normalize(license).includes(normalize(copy.licenseText))) problems.push(`${name}: the packed LICENSE lacks the license text of ${id}`);
    if (!license.includes(`${component.name} ${component.version}`)) problems.push(`${name}: the packed LICENSE does not name ${component.name} ${component.version}`);
  }
  return problems;
}

/** Package-relative paths git tracks under `packageDir`. */
export function trackedFiles(packageDir) {
  return new Set(execFileSync("git", ["ls-files"], { cwd: packageDir, encoding: "utf8" }).split("\n").filter(Boolean));
}

/** `installed` callback for thirdPartyCodeProblems, reading the workspace install. */
export function workspaceInstall(workspaceRoot) {
  return (component) => {
    const dir = installedPackageDir(workspaceRoot, component.name, component.version);
    if (!dir) return null;
    const licenseFile = fs.readdirSync(dir).find((file) => /^LICEN[SC]E(\.md|\.txt)?$/i.test(file));
    return { version: component.version, licenseText: licenseFile ? fs.readFileSync(path.join(dir, licenseFile), "utf8") : "" };
  };
}

export function selfTest() {
  const record = { components: [{ name: "@x/gen", version: "1.0.0", sources: "src/gen/" }] };
  const text = "MIT License\n\nCopyright (c) 2023 X";
  const license = `Ours.\n\nfrom @x/gen 1.0.0 under MIT:\n\n${text}\n`;
  const installed = () => ({ version: "1.0.0", licenseText: text });
  const tracked = new Set(["src/index.ts"]);
  const run = (over) => thirdPartyCodeProblems({ name: "p", sources: new Set(["src/index.ts", "src/gen/a.js"]), tracked, record, license, installed, ...over }).length;
  const cases = [
    ["compliant", run({}), 0],
    ["bundled dependency", run({ sources: new Set(["src/gen/a.js", "../../node_modules/y/index.js"]) }), 1],
    ["unrecorded generated source", run({ sources: new Set(["src/gen/a.js", "src/other.js"]) }), 1],
    ["record without shipped source", run({ sources: new Set(["src/index.ts"]) }), 1],
    ["LICENSE lacks the text", run({ license: "Ours. from @x/gen 1.0.0" }), 1],
    ["LICENSE does not name the version", run({ license: `Ours.\n${text}` }), 1],
    ["not installed", run({ installed: () => null }), 1],
  ];
  const failed = cases.filter(([, actual, expected]) => actual !== expected);
  for (const [label, actual, expected] of failed) console.error(`third-party code ${label}: expected ${expected} problems, got ${actual}`);
  return { count: cases.length, failed: failed.length };
}
