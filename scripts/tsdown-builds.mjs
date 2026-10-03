import path from "node:path";
import { buildEntries } from "./package-entries.mjs";

// ADR-UIP-BLD-002: tsdown builds the entries listed in package-entries.mjs, which
// classifies each entry from its source directive (TDD packaging K1), as two builds
// per package (K2): client-only entries and server-safe entries.
//
// Rolldown outputs a top-level directive when "the module is a entry module", so
// each client-only entry keeps its own "use client" (K3 checks the packed file).
// Its scanner warns MODULE_LEVEL_DIRECTIVE on every top-level directive, kept or
// not; the client build ignores that warning for its own entries only, so a
// directive in any other module still reaches the build log and fails CI.

/**
 * @param {string} packageDir
 * @param {Array<string | RegExp>} neverBundle
 * @returns {import("tsdown").UserConfig[]}
 */
export function packageBuilds(packageDir, neverBundle) {
  const shared = {
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    platform: "neutral",
    target: "es2020",
    minify: false,
    deps: { neverBundle },
  };
  const client = buildEntries(packageDir, "client-only");
  const clientSources = new Set(Object.values(client).map((source) => path.resolve(packageDir, source)));
  return [
    {
      ...shared,
      entry: client,
      inputOptions: (options) => ({
        ...options,
        onLog(level, log, handler) {
          if (log.code === "MODULE_LEVEL_DIRECTIVE" && clientSources.has(path.resolve(packageDir, log.id ?? ""))) return;
          options.onLog(level, log, handler);
        },
      }),
    },
    { ...shared, entry: buildEntries(packageDir, "server-safe") },
  ];
}
