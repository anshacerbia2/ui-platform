import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";
import fs from "node:fs";
import path from "node:path";
import { tsupEntries } from "../../scripts/package-entries.mjs";

// Entries and package `exports` come from one list (scripts/package-entries.mjs).
// Token, theme, Sass, and font assets are published by PLAN P0 rows 4 and 5.
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

/**
 * Publish one aggregate component stylesheet. The barrel entry imports every
 * component stylesheet, so its CSS is the aggregate; per-entry CSS files are
 * not public and are removed from the package.
 */
function publishComponentCss() {
  const distDir = path.resolve("dist");
  const aggregate = path.join(distDir, "components", "index.css");
  if (!fs.existsSync(aggregate)) throw new Error("Aggregate component CSS was not emitted");

  const stylesDir = path.join(distDir, "styles");
  fs.mkdirSync(stylesDir, { recursive: true });
  const css = fs
    .readFileSync(aggregate, "utf8")
    .replace(/\/\*# sourceMappingURL=index\.css\.map \*\//, "/*# sourceMappingURL=components.css.map */");
  fs.writeFileSync(path.join(stylesDir, "components.css"), css);
  if (fs.existsSync(`${aggregate}.map`)) {
    fs.copyFileSync(`${aggregate}.map`, path.join(stylesDir, "components.css.map"));
  }

  for (const file of fs.readdirSync(path.join(distDir, "components"), { recursive: true })) {
    if (typeof file !== "string") continue;
    if (file.endsWith(".css") || file.endsWith(".css.map")) {
      fs.rmSync(path.join(distDir, "components", file));
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
  esbuildPlugins: [
    sassPlugin({
      loadPaths: [path.resolve(import.meta.dirname, "src")],
    }),
  ],
  onSuccess: async () => {
    await restoreDirectives();
    publishComponentCss();
  },
});
