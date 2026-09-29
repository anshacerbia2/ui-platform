import { defineConfig } from "tsup";
import { sassPlugin } from "esbuild-sass-plugin";
import fs from "node:fs";
import path from "node:path";

// ── Style entry points ──
const styleEntries: Record<string, string> = {
  // "styles/base": "src/styles/base/_index.scss",
  // "styles/theme": "src/styles/themes/_index.scss",
  "styles/achromatic-ui": "src/styles/bundles/achromatic-ui.scss",
  "styles/default-ui": "src/styles/bundles/default-ui.scss",
};

// ── Component entry point auto-discovery ──
function getComponentEntries() {
  const entries: Record<string, string> = {};
  const categories = ["atoms", "molecules", "organisms", "layouts"];
  const componentsDir = path.resolve("src/components");

  if (!fs.existsSync(componentsDir)) return entries;

  for (const category of categories) {
    const categoryDir = path.join(componentsDir, category);
    if (!fs.existsSync(categoryDir)) continue;

    const components = fs.readdirSync(categoryDir, { withFileTypes: true });

    for (const component of components) {
      if (!component.isDirectory()) continue;
      const compName = component.name;
      const compDir = path.join(categoryDir, compName);

      const possibleEntries = [
        "index.ts",
        "index.tsx",
        `${compName.charAt(0).toUpperCase() + compName.slice(1)}.tsx`,
      ];

      for (const entryFile of possibleEntries) {
        const fullPath = path.join(compDir, entryFile);
        if (fs.existsSync(fullPath)) {
          // Flattened paths: dist/sidebar/index.js, dist/button/index.js
          entries[`${compName}/index`] = path.relative(process.cwd(), fullPath);
          break;
        }
      }
    }
  }

  // Add the root components barrel file manually
  const rootBarrel = path.join(componentsDir, "index.ts");
  if (fs.existsSync(rootBarrel)) {
    entries["components/index"] = path.relative(process.cwd(), rootBarrel);
  }

  return entries;
}

const componentEntries = getComponentEntries();

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
    if (!file.endsWith('.js') && !file.endsWith('.mjs') && !file.endsWith('.cjs')) continue;

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
  entry: {
    ...styleEntries,
    ...componentEntries,
  },
  format: ["esm", "cjs"],
  // Declarations for TypeScript entries only; style entries have no types.
  dts: { entry: componentEntries },
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
    // Move postbuild tokens here to ensure they persist after clean
    const packageDir = process.cwd();
    const distStylesDir = path.join(packageDir, 'dist', 'styles');
    const abstractsDir = path.join(packageDir, 'src', 'styles', 'abstracts');
    const filesToCopy = ['_core-token.scss', '_contract-token.scss', '_variables.scss'];

    if (!fs.existsSync(distStylesDir)) {
      fs.mkdirSync(distStylesDir, { recursive: true });
    }

    for (const file of filesToCopy) {
      const src = path.join(abstractsDir, file);
      const dest = path.join(distStylesDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to dist/styles`);
      }
    }
  },
});
