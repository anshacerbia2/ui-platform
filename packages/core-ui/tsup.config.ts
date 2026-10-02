import { defineConfig, type Options } from "tsup";
import { tsupEntries } from "../../scripts/package-entries.mjs";

// Entries and package `exports` come from one list (scripts/package-entries.mjs),
// which classifies each entry from its source directive (TDD packaging K1).
// Two builds (K2): client-only entries and their chunks carry a "use client"
// banner; server-safe entries never do. Rollup tree-shaking is off because it
// drops module-level directives. `dist` is cleared once by the build script,
// since the two builds run concurrently.
const shared: Options = {
  // ESM only: no supported CJS consumer is recorded (TDD packaging).
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: false,
  external: ["react", "react-dom", "react-router-dom"],
  splitting: true,
  treeshake: false,
  minify: false,
  target: "es2020",
  platform: "neutral",
};

export default defineConfig([
  {
    ...shared,
    entry: tsupEntries(process.cwd(), "client-only"),
    esbuildOptions(options) {
      options.banner = { js: '"use client";' };
    },
  },
  { ...shared, entry: tsupEntries(process.cwd(), "server-safe") },
]);
