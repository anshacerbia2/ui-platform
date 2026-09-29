// @vitest-environment node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadConfig } from "./check.mjs";
import { contrastRatio, parseColor } from "./color.mjs";
import { parseTokenName, tokenType } from "./grammar.mjs";
import { normalize } from "./normalize.mjs";
import { assertDeclarationSafe, formatNumber, toCss } from "./serialize.mjs";
import { contrastCases, fontFamilies, keySetFindings, stripComments, substitute, validForProperty } from "./validate.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const str = (text) => ({ kind: "string", text, quoted: false });
const num = (value, unit = "") => ({ kind: "number", value, unit });

describe("serializer", () => {
  it("formats numbers like Sass without float noise or negative zero", () => {
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(-0)).toBe("0");
    expect(formatNumber(1.125)).toBe("1.125");
  });

  it("serializes a one-element comma list as its element, not \"(x,)\"", () => {
    const shadow = { kind: "list", separator: ",", brackets: false, items: [{ kind: "list", separator: " ", brackets: false, items: [num(0), num(1, "px"), str("red")] }] };
    expect(toCss(shadow)).toBe("0 1px red");
  });

  it("joins multi-shadow lists with commas", () => {
    const layer = (y) => ({ kind: "list", separator: " ", brackets: false, items: [num(0), num(y, "px"), str("red")] });
    expect(toCss({ kind: "list", separator: ",", brackets: false, items: [layer(1), layer(2)] })).toBe("0 1px red, 0 2px red");
  });

  it("rejects values with no CSS form", () => {
    expect(() => toCss({ kind: "list", separator: null, brackets: false, items: [] })).toThrow("empty list");
    expect(() => toCss({ kind: "null" })).toThrow();
  });

  it("rejects text that escapes the declaration", () => {
    expect(() => assertDeclarationSafe("red; color: blue")).toThrow();
    expect(() => assertDeclarationSafe("red } body {")).toThrow();
    expect(() => assertDeclarationSafe("calc(1px")).toThrow("unbalanced");
    expect(() => assertDeclarationSafe('"a;b", serif')).not.toThrow();
  });
});

describe("grammar (STD-UIP-TKN-001)", () => {
  it.each([
    ["--ds-color-primary-surface-solid-default", "color"],
    ["--ds-color-neutral-surface-canvas-default", "color"],
    ["--ds-color-danger-text-contrast-hover", "color"],
    ["--ds-color-neutral-border-default-focus", "color"],
    ["--ds-effect-shadow-overlay", "shadow"],
    ["--ds-motion-enter-duration", "duration"],
    ["--ds-motion-disclosure-easing", "cubicBezier"],
  ])("accepts %s", (name, type) => {
    expect(parseTokenName(name)).toMatchObject({ valid: true, tier: 2, type });
  });

  it.each([
    ["--ds-color-black-surface-subtle-default", "unknown scheme"],
    ["--ds-color-primary-solid-default-default", "unknown role"],
    ["--ds-color-primary-surface-contrast-default", "not allowed for role"],
    ["--ds-color-primary-surface-canvas-default", "neutral-only"],
    ["--ds-color-primary-text-default-pressed", "not allowed for role"],
    ["--ds-color-primary-border-default-hover", "not allowed for role"],
    ["--ds-color-neutral-canvas-default", "color names are"],
    ["--ds-shadow-lg", "not a canonical"],
    ["--ds-effect-shadow-sm", "effect names are"],
    ["--ds-motion-duration-fast", "motion names are"],
    ["--ds-dimension-z-index-modal", "pending a ratified revision"],
    ["--ds-typography-data-compact", "pending a ratified revision"],
  ])("rejects %s", (name, error) => {
    const parsed = parseTokenName(name);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain(error);
  });

  it("accepts a Tier-3 name only with an alias review record", () => {
    const aliases = { "--ds-button-surface-hover": { type: "color", path: "button.surface.hover" } };
    expect(parseTokenName("--ds-button-surface-hover").valid).toBe(false);
    expect(parseTokenName("--ds-button-surface-hover", aliases)).toMatchObject({ valid: true, tier: 3 });
  });

  it("types baseline names so value checks still run during migration", () => {
    expect(tokenType("--ds-spacing-md")).toBe("dimension");
    expect(tokenType("--ds-z-modal")).toBe("number");
    expect(tokenType("--ds-transition-hover")).toBeNull();
  });
});

describe("references and values", () => {
  const values = new Map([
    ["--ds-a", "var(--ds-b)"],
    ["--ds-b", "oklch(0.5 0.1 250)"],
    ["--ds-loop-1", "var(--ds-loop-2)"],
    ["--ds-loop-2", "var(--ds-loop-1)"],
  ]);
  const lookup = (name) => values.get(name);

  it("substitutes reference chains", () => {
    expect(substitute("0 1px var(--ds-a)", lookup)).toMatchObject({ value: "0 1px oklch(0.5 0.1 250)", missing: [], cycles: [] });
  });

  it("reports undefined references with their chain", () => {
    const result = substitute("var(--ds-a) var(--ds-missing, red)", lookup);
    expect(result.missing).toEqual([{ name: "--ds-missing", chain: ["--ds-missing"] }]);
    expect(result.value).toBe("oklch(0.5 0.1 250) red");
  });

  it("reports reference cycles", () => {
    expect(substitute("var(--ds-loop-1)", lookup).cycles).toHaveLength(1);
  });

  it("validates values against their consuming property", () => {
    expect(validForProperty("box-shadow", "0 1px 2px 0 oklch(0.2 0 0 / 0.1)")).toBeNull();
    expect(validForProperty("box-shadow", "(0 1px 2px 0 red,)")).not.toBeNull();
    expect(validForProperty("box-shadow", "0 1px 3px rgb(oklch(0.2 0 0))")).not.toBeNull();
    expect(validForProperty("transition-timing-function", "cubic-bezier(0.4, 0, 0.2, 1)")).toBeNull();
  });

  it("splits font stacks and unquotes family names", () => {
    expect(fontFamilies('"JetBrains Mono", ui-monospace, monospace')).toEqual(["JetBrains Mono", "ui-monospace", "monospace"]);
  });

  it("ignores commented-out references at callsites", () => {
    expect(stripComments("a: var(--ds-x); // b: var(--ds-y)\n/* var(--ds-z) */")).not.toMatch(/ds-[yz]/);
    expect(stripComments("background: url(https://example.com/a.png);")).toContain("https://");
  });
});

describe("theme parity and contrast", () => {
  it("reports a key missing from one theme/mode", () => {
    const themes = {
      default: { light: { records: new Map([["--ds-effect-shadow-low", {}], ["--ds-effect-shadow-high", {}]]) } },
      brand: { light: { records: new Map([["--ds-effect-shadow-low", {}]]) } },
    };
    expect(keySetFindings(themes, {})).toEqual([
      expect.objectContaining({ category: "key-set", theme: "brand", mode: "light", token: "--ds-effect-shadow-high" }),
    ]);
  });

  it("computes WCAG ratios and composites alpha on the actual background", () => {
    const white = parseColor("rgb(255 255 255)");
    expect(contrastRatio(parseColor("rgb(0 0 0)"), white, white)).toBeCloseTo(21, 5);
    // 50% black on white displays as mid-gray, not black.
    expect(contrastRatio(parseColor("rgb(0 0 0 / 0.5)"), white, white)).toBeCloseTo(3.95, 1);
  });

  it("pairs contrast text with the solid surface of its scheme per state", () => {
    const names = new Set(["--ds-color-primary-text-contrast-default", "--ds-color-primary-surface-solid-default"]);
    const cases = contrastCases(names, { contrast: { textMinimum: 4.5, nonTextMinimum: 3, neutralBackgrounds: [] } });
    expect(cases).toContainEqual({ rule: "contrast-on-solid", fg: "--ds-color-primary-text-contrast-default", bg: "--ds-color-primary-surface-solid-default", minimum: 4.5 });
  });
});

describe("normalizer on the token source", () => {
  const config = loadConfig(path.join(packageDir, "tokens.config.json"));
  const { themes } = normalize({ packageDir, config });

  it("exposes identical key sets in every theme and mode, without duplicate names", () => {
    const sets = Object.values(themes).flatMap((modes) => Object.values(modes));
    const first = [...sets[0].records.keys()].sort();
    for (const { records, duplicates } of sets) {
      expect([...records.keys()].sort()).toEqual(first);
      expect(duplicates).toEqual([]);
    }
  });

  it("emits the public shadow set and no Tier-1 shadow sizes", () => {
    const names = [...themes.achromatic.light.records.keys()];
    expect(names.filter((name) => name.startsWith("--ds-effect-shadow-")).sort()).toEqual(
      ["high", "low", "medium", "overlay", "focus"].map((s) => `--ds-effect-shadow-${s}`).sort(),
    );
    expect(names.some((name) => /^--ds-shadow-/.test(name))).toBe(false);
  });

  it("serializes every shadow to a valid box-shadow once references resolve", () => {
    const { records } = themes.default.light;
    const css = new Map([...records].map(([name, value]) => [name, toCss(value)]));
    for (const name of [...css.keys()].filter((n) => n.startsWith("--ds-effect-shadow-"))) {
      const { value, missing } = substitute(css.get(name), (n) => css.get(n));
      expect(missing).toEqual([]);
      expect(validForProperty("box-shadow", value)).toBeNull();
    }
  });
});

describe("configuration", () => {
  it("rejects unknown keys", async () => {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tokens-config-")), "tokens.config.json");
    const config = JSON.parse(fs.readFileSync(path.join(packageDir, "tokens.config.json"), "utf8"));
    fs.writeFileSync(file, JSON.stringify({ ...config, surprise: true }));
    expect(() => loadConfig(file)).toThrow('unknown key "surprise"');
  });
});
