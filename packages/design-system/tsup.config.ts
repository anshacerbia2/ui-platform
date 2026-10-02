import { defineConfig, type Options } from "tsup";
import { tsupEntries } from "../../scripts/package-entries.mjs";

// Entries and package `exports` come from one list (scripts/package-entries.mjs),
// which classifies each entry from its source directive (TDD packaging K1).
// Token, theme, Sass, and font assets are written by scripts/tokens/emit.mjs and
// the aggregate stylesheet by scripts/styles/assemble.mjs.
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
  external: ["react", "react-dom", "@scnx/core-ui"],
  splitting: true,
  treeshake: false,
  minify: false,
  target: "es2020",
  platform: "neutral",
  // Component JavaScript imports no CSS (TDD CSS delivery STY-004);
  // scripts/styles/assemble.mjs writes styles/components.css after this build.
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
