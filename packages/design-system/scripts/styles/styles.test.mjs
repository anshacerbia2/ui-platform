// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { emit } from "../tokens/emit.mjs";
import { assemble, pandaRecipes } from "./assemble.mjs";
import { THEME_ROOT, checkStylesheet } from "./check-css.mjs";
import { LAYER_STATEMENT } from "./layers.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("Panda recipe extraction", () => {
  const panda = `@layer reset, base, tokens, recipes, utilities;
@layer base { :root { --made-with-panda: '🐼'; } }
@layer tokens { :where(:root, :host) { --colors-x: red; } }
@layer recipes {
  @layer _base { .flex { display: flex; } }
  .flex--gap_none { gap: 0; }
}
@layer utilities { .d_flex { display: flex; } }`;

  it("keeps only recipe rules, base before variants, with no Panda sublayer", () => {
    const rules = pandaRecipes(panda);
    expect(rules.indexOf(".flex {")).toBeLessThan(rules.indexOf(".flex--gap_none"));
    expect(rules).not.toMatch(/@layer|:root|--made-with-panda|d_flex/);
  });

  it("rejects an unknown recipes sublayer", () => {
    expect(() => pandaRecipes("@layer recipes { @layer other { .flex { gap: 0 } } }")).toThrow("unexpected Panda sublayer");
  });
});

describe("published stylesheets", () => {
  let dist;
  beforeAll(() => {
    dist = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-styles-"));
    emit({ packageDir, outDir: dist });
    assemble(dist);
  }, 60000);
  const read = (file) => fs.readFileSync(path.join(dist, file), "utf8");

  it("open with the canonical layer order", () => {
    for (const file of ["styles/components.css", "tokens/css/default.css", "tokens/css/achromatic.css"]) {
      expect(read(file)).toContain(LAYER_STATEMENT);
    }
  });

  it("contain no global :root, html, or body rule", () => {
    const css = read("styles/components.css");
    expect(css).not.toMatch(/(^|[\s,}]):root\b|(^|[\s,}])(html|body)\s*[{,]/m);
    expect(css).not.toMatch(/outline:\s*none/);
  });

  it("draw a focus-visible outline below the theme root, with a forced-colors system color", () => {
    const css = read("styles/components.css");
    expect(css).toContain(`${THEME_ROOT} :focus-visible {\n    outline: var(--ds-dimension-border-width-strong) solid var(--ds-color-primary-border-default-focus);`);
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s+:where\(\[data-scnx-theme\]\[data-scnx-resolved-mode\]\) :focus-visible \{\s+outline-color: Highlight;/);
  });

  it("ship the frozen Panda recipes in the recipes layer", () => {
    const css = read("styles/components.css");
    const recipes = css.slice(css.indexOf("@layer recipes {"));
    for (const name of [".flex", ".grid", ".heading", ".text", ".list", ".code", ".container"]) expect(recipes).toContain(`${name} {`);
    expect(recipes).toContain("row-gap: var(--ds-dimension-spacing-stack-comfortable)");
  });

  it("are byte-for-byte reproducible", () => {
    const again = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-styles-"));
    emit({ packageDir, outDir: again });
    assemble(again);
    expect(fs.readFileSync(path.join(again, "styles/components.css"), "utf8")).toBe(read("styles/components.css"));
  }, 60000);
});

describe("stylesheet gate", () => {
  it("accepts a documented runtime property and rejects an undocumented one", () => {
    const sheet = (name) => `${LAYER_STATEMENT}\n@layer components { .scnx-a { transition-delay: calc(var(${name}) * 1ms); } }`;
    expect(checkStylesheet(sheet("--item-index"), { tokenNames: new Set() }).findings).toEqual([]);
    expect(checkStylesheet(sheet("--item-order"), { tokenNames: new Set() }).findings.join()).toContain("var(--item-order)");
  });
});
