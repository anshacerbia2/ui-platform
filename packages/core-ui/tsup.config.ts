import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";
import { tsupEntries } from "../../scripts/package-entries.mjs";

// Entries and package `exports` come from one list (scripts/package-entries.mjs).
const entryPoints = tsupEntries(process.cwd());

/**
 * Robust "use client" restoration for tsup splitting.
 * Due to tsup's chunking algorithm, esbuild plugins drop directives during the linking phase.
 * We safely identify client chunks via React imports.
 */
async function restoreDirectives() {
  const distDir = path.resolve("dist");
  if (!fs.existsSync(distDir)) return;

  const files = fs.readdirSync(distDir, { recursive: true });
  const reactImportRe = /(?:import\s+.*?from\s+['"]react['"]|require\(['"]react['"]\))/;
  const hooksRe = /\b(useState|useEffect|useRef|useContext|useMemo|useCallback|useReducer|useLayoutEffect)\b/;

  for (const file of files) {
    if (typeof file !== 'string') continue;
    if (!file.endsWith('.js')) continue;

    const filePath = path.join(distDir, file);
    const content = await fs.promises.readFile(filePath, "utf8");

    if (content.includes('"use client"') || content.includes("'use client'")) continue;

    if (reactImportRe.test(content) && hooksRe.test(content)) {
      await fs.promises.writeFile(filePath, `"use client";\n${content}`);
    }
  }
}

export default defineConfig({
  entry: entryPoints,
  // ESM only: no supported CJS consumer is recorded (TDD packaging).
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react-router-dom"],
  splitting: true,
  treeshake: {
    preset: "smallest",
    moduleSideEffects: false,
  },
  minify: false,
  target: "es2020",
  platform: "neutral",
  onSuccess: async () => {
    await restoreDirectives();
  },
});
