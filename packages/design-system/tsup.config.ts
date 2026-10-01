import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";
import { tsupEntries } from "../../scripts/package-entries.mjs";

// Entries and package `exports` come from one list (scripts/package-entries.mjs).
// Token, theme, Sass, and font assets are written by scripts/tokens/emit.mjs and
// the aggregate stylesheet by scripts/styles/assemble.mjs.
const componentEntries = tsupEntries(process.cwd());

/**
 * Robust "use client" restoration for tsup splitting.
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

    // Logic 2: Check for source comments that point to client-only files
    const hasClientSource = content.includes('// src/components/') && (
      content.includes('TableOfContents.tsx') ||
      content.includes('SidebarRoot.tsx') ||
      content.includes('SidebarToggle.tsx') ||
      content.includes('SidebarNavItem.tsx') ||
      content.includes('SidebarContext.tsx') ||
      content.includes('FlyoutContext.tsx') ||
      content.includes('ThemeToggle.tsx')
    );

    if ((reactImportRe.test(content) && hooksRe.test(content)) || hasClientSource) {
      await fs.promises.writeFile(filePath, `"use client";\n${content}`);
    }
  }
}

export default defineConfig({
  entry: componentEntries,
  // ESM only: no supported CJS consumer is recorded (TDD packaging).
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@scnx/core-ui"],
  splitting: true,
  treeshake: { preset: "smallest", moduleSideEffects: true },
  minify: false,
  target: "es2020",
  platform: "neutral",
  // Component JavaScript imports no CSS (TDD CSS delivery STY-004);
  // scripts/styles/assemble.mjs writes styles/components.css after this build.
  onSuccess: async () => {
    await restoreDirectives();
  },
});
