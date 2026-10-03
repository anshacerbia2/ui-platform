import { defineConfig } from "tsdown";
import { buildEntries } from "../../scripts/package-entries.mjs";

// ADR-UIP-BLD-002: tsdown builds the entries listed in scripts/package-entries.mjs,
// which classifies each entry from its source directive (TDD packaging K1).
// Two builds (K2):
// client-only entries carry a "use client" banner; server-safe entries none.
/** @type {import("tsdown").UserConfig} */
const shared = {
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: false,
  platform: "neutral",
  target: "es2020",
  minify: false,
  deps: { neverBundle: ["react", "react-dom"] },
};

export default defineConfig([
  {
    ...shared,
    entry: buildEntries(process.cwd(), "client-only"),
    outputOptions: { banner: '"use client";' },
  },
  { ...shared, entry: buildEntries(process.cwd(), "server-safe") },
]);
