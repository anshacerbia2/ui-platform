#!/usr/bin/env node
// Module Federation share map for the P0 evaluation fixture (ADR-GLB-FE-012
// section 5 items 1-3; TDD packaging "Conditional federation evaluation", F2-F4).
// Share keys are explicit and generated from the packed export inventory:
// every public JavaScript subpath of every package, plus the React entries an
// application imports. Every key is a strict singleton. `requiredVersion` is
// the range the consuming application declares for that package; only the
// host provides a module, so a remote never falls back to its own copy.
//
//   node scripts/federation-share-map.mjs --self-test

/** React entries applications import directly or through the JSX transform. */
export const REACT_KEYS = ["react", "react/jsx-runtime", "react-dom", "react-dom/client"];

/** Package name of a module request: `@scope/name/sub` -> `@scope/name`. */
export function packageOf(request) {
  const parts = request.split("/");
  return request.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/**
 * Every share key: the React entries and every public JavaScript subpath in the
 * pack report (`environments` lists exactly the JavaScript entries).
 * @param {{ packages: { name: string, environments: Record<string, string> }[] }} packReport
 */
export function shareKeys(packReport) {
  const keys = [...REACT_KEYS];
  for (const pkg of packReport.packages) {
    for (const subpath of Object.keys(pkg.environments)) keys.push(`${pkg.name}${subpath.slice(1)}`);
  }
  return keys;
}

/**
 * The `shared` option for one application.
 * @param {object} options
 * @param {"host" | "remote"} options.role
 * @param {{ name: string, peerDependencies?: Record<string, string>, dependencies?: Record<string, string> }} options.manifest
 *   the application's declared contract; ranges come from peerDependencies, then dependencies
 * @param {{ packages: { name: string, environments: Record<string, string> }[] }} options.packReport
 * @param {(packageName: string) => string} options.installedVersion version the host provides
 */
export function shareMap({ role, manifest, packReport, installedVersion }) {
  const shared = {};
  for (const key of shareKeys(packReport)) {
    const pkg = packageOf(key);
    const range = manifest.peerDependencies?.[pkg] ?? manifest.dependencies?.[pkg];
    if (typeof range !== "string" || !/^[\^~<>=\d]/.test(range)) {
      throw new Error(`${manifest.name} declares no semver range for ${pkg} (found ${JSON.stringify(range)})`);
    }
    shared[key] = {
      singleton: true,
      strictVersion: true,
      requiredVersion: range,
      ...(role === "host" ? { version: installedVersion(pkg), eager: false } : { import: false }),
    };
  }
  return shared;
}

function selfTest() {
  const packReport = { packages: [{ name: "@scnx/core-ui", environments: { "./components/a": "client-only", "./components/b": "server-safe" } }] };
  const manifest = { name: "app", peerDependencies: { react: "^19.0.0", "react-dom": "^19.0.0", "@scnx/core-ui": "^1.0.0" } };
  const failures = [];
  const check = (label, condition) => condition || failures.push(label);

  const host = shareMap({ role: "host", manifest, packReport, installedVersion: (pkg) => (pkg === "@scnx/core-ui" ? "1.0.0" : "19.3.0") });
  check("every public subpath is a key", "@scnx/core-ui/components/a" in host && "@scnx/core-ui/components/b" in host);
  check("the JSX runtime is a key", "react/jsx-runtime" in host);
  check("every key is a strict singleton", Object.values(host).every((s) => s.singleton && s.strictVersion));
  check("the host provides the installed version", host["@scnx/core-ui/components/a"].version === "1.0.0" && host["react/jsx-runtime"].version === "19.3.0");
  check("a subpath takes its package's range", host["react-dom/client"].requiredVersion === "^19.0.0");

  const remote = shareMap({ role: "remote", manifest, packReport, installedVersion: () => "x" });
  check("a remote provides nothing", Object.values(remote).every((s) => s.import === false && !("version" in s)));

  let threw = false;
  try {
    shareMap({ role: "remote", manifest: { ...manifest, peerDependencies: { ...manifest.peerDependencies, "@scnx/core-ui": "file:../x.tgz" } }, packReport, installedVersion: () => "x" });
  } catch {
    threw = true;
  }
  check("a non-semver range is rejected", threw);

  if (failures.length > 0) {
    console.error(`Share-map self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("Share-map self-test passed: 7 checks");
}

if (process.argv.includes("--self-test")) selfTest();
