import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

/**
 * Dynamically discovers entry points for components and hooks.
 */
function getEntryPoints() {
  const entries: Record<string, string> = {};
  const categories = ["components", "hooks", "providers"];
  const srcDir = path.resolve("src");

  if (!fs.existsSync(srcDir)) return entries;

  for (const category of categories) {
    const categoryDir = path.join(srcDir, category);
    if (!fs.existsSync(categoryDir)) continue;

    const items = fs.readdirSync(categoryDir, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const itemName = item.name;
      const itemDir = path.join(categoryDir, itemName);
      
      // Discovery Priority: index.ts or index.tsx
      const possibleEntries = ["index.ts", "index.tsx"];

      for (const entryFile of possibleEntries) {
        const fullPath = path.join(itemDir, entryFile);
        if (fs.existsSync(fullPath)) {
          // Output key format: components/button-base/index, hooks/use-on-click-outside/index
          entries[`${category}/${itemName}/index`] = path.relative(process.cwd(), fullPath);
          break;
        }
      }
    }
  }

  return entries;
}

const entryPoints = getEntryPoints();

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
    if (!file.endsWith('.js') && !file.endsWith('.mjs') && !file.endsWith('.cjs')) continue;

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
  format: ["esm", "cjs"],
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
