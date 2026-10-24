// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { beforeAll, describe, expect, it } from "vitest";
import { loadConfig } from "./check.mjs";
import { contrastByPath, contrastRatio, parseColor } from "./color.mjs";
import { consumingProperty, parseTokenName, tokenType } from "./grammar.mjs";
import { emit, serializeThemes, themeSelector } from "./emit.mjs";
import { pixelValue, srgbValue } from "./figma.mjs";
import { normalize } from "./normalize.mjs";
import { assertDeclarationSafe, formatNumber, toCss } from "./serialize.mjs";
import { contrastCases, easingDirection, fontFamilies, keySetFindings, measure, orderFindings, stripComments, substitute, validForProperty } from "./validate.mjs";

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
    ["--ds-motion-feedback-duration", "duration"],
    ["--ds-dimension-spacing-inset-compact", "dimension"],
    ["--ds-dimension-spacing-page", "dimension"],
    ["--ds-dimension-radius-pill", "dimension"],
    ["--ds-dimension-border-width-strong", "dimension"],
    ["--ds-dimension-z-index-modal", "number"],
    ["--ds-typography-body-default-font-size", "dimension"],
    ["--ds-typography-heading-xxlarge-letter-spacing", "dimension"],
    ["--ds-typography-code-small-font-family", "fontFamily"],
    ["--ds-typography-data-compact-line-height", "number"],
    ["--ds-typography-weight-semibold", "fontWeight"],
  ])("accepts %s", (name, type) => {
    expect(parseTokenName(name)).toMatchObject({ valid: true, tier: 2, type });
  });

  it("maps hyphenated properties, intents, and members to dotted paths", () => {
    expect(parseTokenName("--ds-dimension-spacing-inset-compact").path).toBe("dimension.spacing.inset-compact");
    expect(parseTokenName("--ds-dimension-z-index-modal").path).toBe("dimension.z-index.modal");
    expect(parseTokenName("--ds-typography-heading-xlarge-font-size").path).toBe("typography.heading.xlarge.font-size");
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
    ["--ds-spacing-md", "not a canonical"],
    ["--ds-z-modal", "not a canonical"],
    ["--ds-transition-hover", "not a canonical"],
    ["--ds-dimension-z-modal", "dimension names are"],
    ["--ds-dimension-spacing-md", "dimension names are"],
    ["--ds-dimension-spacing-inset", "dimension names are"],
    ["--ds-dimension-size-control-md", "dimension names are"],
    ["--ds-typography-data-compact", "typography names are"],
    ["--ds-typography-body-default-color", "typography names are"],
    ["--ds-typography-heading-1-font-size", "typography names are"],
    ["--ds-typography-weight-thin", "typography names are"],
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

  it("types only canonical names", () => {
    expect(tokenType("--ds-spacing-md")).toBeNull();
    expect(tokenType("--ds-transition-hover")).toBeNull();
  });

  it("validates each value against the property its path names", () => {
    expect(consumingProperty("--ds-dimension-z-index-modal", "number")).toBe("z-index");
    expect(consumingProperty("--ds-dimension-radius-control", "dimension")).toBe("border-radius");
    expect(consumingProperty("--ds-typography-label-small-letter-spacing", "dimension")).toBe("letter-spacing");
    expect(consumingProperty("--ds-typography-body-default-line-height", "number")).toBe("line-height");
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

describe("value relationships (STD-UIP-TKN-001 section 3)", () => {
  const valid = () => new Map([
    ["--ds-dimension-spacing-inset-compact", "0.5rem"],
    ["--ds-dimension-spacing-inset-default", "1rem"],
    ["--ds-dimension-spacing-inset-comfortable", "24px"],
    ["--ds-dimension-spacing-control-compact", "0.5rem"],
    ["--ds-dimension-spacing-control-default", "0.75rem"],
    ["--ds-dimension-spacing-control-comfortable", "1rem"],
    ["--ds-dimension-z-index-base", "0"],
    ["--ds-dimension-z-index-dropdown", "1000"],
    ["--ds-dimension-radius-element", "0.5rem"],
    ["--ds-dimension-radius-control", "12px"],
    ["--ds-dimension-radius-pill", "9999px"],
    ["--ds-typography-heading-xxlarge-font-size", "3rem"],
    ["--ds-typography-heading-xlarge-font-size", "2.5rem"],
    ["--ds-typography-weight-regular", "400"],
    ["--ds-typography-weight-bold", "700"],
    ["--ds-motion-enter-duration", "300ms"],
    ["--ds-motion-enter-easing", "cubic-bezier(0, 0, 0.2, 1)"],
    ["--ds-motion-exit-duration", "0.2s"],
    ["--ds-motion-exit-easing", "cubic-bezier(0.4, 0, 1, 1)"],
    ["--ds-motion-feedback-duration", "150ms"],
  ]);

  it("accepts ordered values across units", () => {
    expect(measure("1.5rem")).toEqual({ value: 24, unit: "px" });
    expect(measure("0.2s")).toEqual({ value: 200, unit: "ms" });
    expect(orderFindings(valid())).toEqual([]);
  });

  it.each([
    ["--ds-dimension-spacing-inset-default", "0.5rem", "spacing inset ascends"],
    ["--ds-dimension-spacing-control-default", "1rem", "spacing control ascends"],
    ["--ds-dimension-z-index-dropdown", "0", "z-index strictly ascends"],
    ["--ds-dimension-radius-control", "8px", "radius strictly ascends"],
    ["--ds-typography-heading-xlarge-font-size", "4rem", "heading sizes descend"],
    ["--ds-typography-weight-bold", "300", "weights ascend"],
    ["--ds-motion-exit-duration", "400ms", "exceeds motion.enter.duration"],
    ["--ds-motion-feedback-duration", "200ms", "not shorter than motion.exit.duration"],
    ["--ds-motion-enter-easing", "cubic-bezier(0.4, 0, 1, 1)", "must be decelerating"],
    ["--ds-motion-exit-easing", "cubic-bezier(0.4, 0, 0.2, 1)", "must be accelerating"],
  ])("rejects %s = %s", (name, value, message) => {
    const values = valid();
    values.set(name, value);
    expect(orderFindings(values).map((f) => f.message).join("\n")).toContain(message);
  });

  it("classifies easing curves by their control points", () => {
    expect(easingDirection("cubic-bezier(0, 0, 0.2, 1)")).toBe("decelerating");
    expect(easingDirection("ease-in")).toBe("accelerating");
    expect(easingDirection("cubic-bezier(0.4, 0, 0.2, 1)")).toBeNull();
    expect(easingDirection("linear")).toBeNull();
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
    expect(contrastRatio(parseColor("rgb(0 0 0)"), white, white).ratio).toBeCloseTo(21, 5);
    // 50% black on white displays as mid-gray, not black.
    expect(contrastRatio(parseColor("rgb(0 0 0 / 0.5)"), white, white).ratio).toBeCloseTo(3.95, 1);
  });

  it("takes the lowest ratio over every display path of an out-of-gamut color", () => {
    const white = parseColor("rgb(255 255 255)");
    // Outside sRGB: 3.05:1 when gamut mapped, 2.99:1 when clipped, as Chromium and Firefox display it.
    const yellow = parseColor("oklch(0.66 0.3 105)");
    const byPath = Object.fromEntries(contrastByPath(yellow, white, white).map(({ path, ratio }) => [path, ratio]));
    expect(Object.keys(byPath)).toEqual(["srgb-clip", "srgb-map", "p3-clip", "p3-map"]);
    expect(byPath["srgb-map"]).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(yellow, white, white)).toEqual({ path: "srgb-clip", ratio: byPath["srgb-clip"] });
    expect(byPath["srgb-clip"]).toBeLessThan(3);
    // An sRGB color displays the same on every path.
    const ratios = contrastByPath(parseColor("rgb(118 118 118)"), white, white).map(({ ratio }) => ratio);
    for (const ratio of ratios) expect(ratio).toBeCloseTo(ratios[0], 2);
  });

  it("tests every focus border on the neutral surfaces at the non-text minimum", () => {
    const names = new Set(["--ds-color-primary-border-default-focus"]);
    const cases = contrastCases(names, { contrast: { textMinimum: 4.5, nonTextMinimum: 3, neutralBackgrounds: ["--ds-bg"] } });
    expect(cases).toContainEqual({ rule: "focus-on-neutral-surface", fg: "--ds-color-primary-border-default-focus", bg: "--ds-bg", minimum: 3 });
  });

  it("tests the neutral strong border, the control boundary, at the non-text minimum", () => {
    const names = new Set(["--ds-color-neutral-border-strong-default", "--ds-color-primary-border-strong-default"]);
    const cases = contrastCases(names, { contrast: { textMinimum: 4.5, nonTextMinimum: 3, neutralBackgrounds: ["--ds-bg"] } });
    expect(cases).toContainEqual({ rule: "control-boundary-on-neutral-surface", fg: "--ds-color-neutral-border-strong-default", bg: "--ds-bg", minimum: 3 });
    expect(cases.some((c) => c.fg === "--ds-color-primary-border-strong-default")).toBe(false);
  });

  it("adds every pair a styled specification renders at the text minimum (TDD styled CS5)", () => {
    const rendered = [{ fg: "--ds-color-primary-text-contrast-default", bg: "--ds-color-primary-surface-solid-default", where: "button root rest" }];
    const cases = contrastCases(new Set(), { contrast: { textMinimum: 4.5, nonTextMinimum: 3, neutralBackgrounds: [] } }, rendered);
    expect(cases).toEqual([{ rule: "rendered-by-component", fg: rendered[0].fg, bg: rendered[0].bg, minimum: 4.5, where: "button root rest" }]);
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

  it("labels each disabled solid fill with the neutral disabled text, not the full-contrast label", () => {
    // Disabled states are exempt from SC 1.4.3, so this is not a contrast gate:
    // it pins the pairing. The full-contrast label measured about 1.2:1 on the
    // quiet disabled fill; the neutral disabled step measures 2.9:1 or more.
    for (const modes of Object.values(themes)) {
      for (const { records } of Object.values(modes)) {
        const css = (name) => toCss(records.get(name));
        const canvas = parseColor(css("--ds-color-neutral-surface-canvas-default"));
        for (const scheme of ["primary", "neutral", "info", "success", "warning", "danger"]) {
          for (const role of ["text", "icon"]) {
            const label = `--ds-color-${scheme}-${role}-contrast-disabled`;
            expect(css(label)).toBe(css(`--ds-color-neutral-${role}-default-disabled`));
            const fill = parseColor(css(`--ds-color-${scheme}-surface-solid-disabled`));
            expect(contrastRatio(parseColor(css(label)), fill, canvas).ratio).toBeGreaterThan(2.5);
          }
        }
      }
    }
  });

  it("emits the public shadow set and no Tier-1 shadow sizes", () => {
    const names = [...themes.achromatic.light.records.keys()];
    expect(names.filter((name) => name.startsWith("--ds-effect-shadow-")).sort()).toEqual(
      ["high", "low", "medium", "overlay", "focus"].map((s) => `--ds-effect-shadow-${s}`).sort(),
    );
    expect(names.some((name) => /^--ds-shadow-/.test(name))).toBe(false);
  });

  it.each(["light", "dark"])("serializes every shadow and material to a valid box-shadow in %s once references resolve", (mode) => {
    const { records } = themes.default[mode];
    const css = new Map([...records].map(([name, value]) => [name, toCss(value)]));
    const shadows = [...css.keys()].filter((n) => /^--ds-effect-(shadow|material)-/.test(n));
    expect(shadows.length).toBe(12);
    for (const name of shadows) {
      const { value, missing } = substitute(css.get(name), (n) => css.get(n));
      expect(missing).toEqual([]);
      expect(validForProperty("box-shadow", value)).toBeNull();
    }
  });

  it("emits the material set in every theme, ringed except tooltip, with a lit edge only on dark floating materials (TDD SI3-SI4)", () => {
    const materials = ["flat", "raised", "panel", "tooltip", "menu", "modal", "sheet"];
    const ring = "0 0 0 1px var(--ds-color-neutral-border-subtle-default)";
    const lit = "inset 0 1px 0 0 var(--ds-color-neutral-border-default-default)";
    for (const [theme, modes] of Object.entries(themes)) {
      for (const [mode, { records }] of Object.entries(modes)) {
        const names = [...records.keys()].filter((n) => n.startsWith("--ds-effect-material-"));
        expect(names.sort(), `${theme}/${mode}`).toEqual(materials.map((m) => `--ds-effect-material-${m}`).sort());
        for (const m of materials) {
          const value = toCss(records.get(`--ds-effect-material-${m}`));
          expect(value.includes(ring), `${theme}/${mode} ${m} ring`).toBe(m !== "tooltip");
          expect(value.startsWith(lit), `${theme}/${mode} ${m} lit edge`).toBe(mode === "dark" && ["menu", "modal", "sheet"].includes(m));
        }
      }
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

  it("rejects font publish paths outside fonts/ and duplicates", async () => {
    const fs = await import("node:fs");
    const os = await import("node:os");
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tokens-config-")), "tokens.config.json");
    const config = JSON.parse(fs.readFileSync(path.join(packageDir, "tokens.config.json"), "utf8"));
    const inter = config.fonts.assets.Inter;
    inter.faces[1].publish = inter.faces[0].publish;
    inter.license.publish = "../escape.txt";
    fs.writeFileSync(file, JSON.stringify(config));
    expect(() => loadConfig(file)).toThrow(/used twice[\s\S]*|publish path must be fonts/);
  });
});

describe("emitters", () => {
  it("stops when theme key sets differ", () => {
    const records = (names) => ({ records: new Map(names.map((n) => [n, str("0")])), origin: new Map(), duplicates: [] });
    const themes = { default: { light: records(["--ds-a", "--ds-b"]) }, brand: { light: records(["--ds-a"]) } };
    expect(() => serializeThemes(themes)).toThrow("Token emission stopped");
  });

  describe("on the token source", () => {
    const config = loadConfig(path.join(packageDir, "tokens.config.json"));
    let dirs;
    let runs;
    const read = (file) => fs.readFileSync(path.join(dirs[0], file), "utf8");
    beforeAll(() => {
      dirs = [0, 1].map(() => fs.mkdtempSync(path.join(os.tmpdir(), "tokens-emit-")));
      runs = dirs.map((outDir) => emit({ packageDir, outDir }));
    });

    it("is reproducible byte for byte", () => {
      expect(runs[1]).toEqual(runs[0]);
      expect(runs[0].length).toBeGreaterThan(0);
    });

    it("emits CSS and JSON with the same names and values per theme and mode", () => {
      for (const themeId of Object.keys(config.themes)) {
        const json = JSON.parse(read(`tokens/json/${themeId}.json`));
        const css = read(`tokens/css/${themeId}.css`);
        for (const mode of json.modes) {
          const start = css.indexOf(`${themeSelector(themeId, mode)} {`);
          expect(start).toBeGreaterThan(-1);
          const block = css.slice(start, css.indexOf("}", start));
          const declared = Object.fromEntries([...block.matchAll(/(--ds-[\w-]+): ([^;]+);/g)].map((m) => [m[1], m[2]]));
          const expected = Object.fromEntries(json.tokens.map((t) => [t.cssName, t.themes[themeId][mode]]));
          expect(declared).toEqual(expected);
        }
      }
    });

    it("loads declared font faces from files it writes", () => {
      const css = read("tokens/css/default.css");
      const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) expect(fs.existsSync(path.join(dirs[0], "tokens/css", url))).toBe(true);
    });

    it("emits a Sass contract that references every custom property", () => {
      const json = JSON.parse(read("tokens/json/default.json"));
      const probe = json.tokens.map((t, i) => `.t${i} { v: tokens.$${t.cssName.slice(5)}; }`).join("\n");
      const out = sass.compileString(`@use "tokens/scss" as tokens;\n${probe}`, { loadPaths: [dirs[0]] }).css;
      for (const token of json.tokens) expect(out).toContain(`v: var(${token.cssName})`);
      expect(() => sass.compileString('@use "tokens/scss" as tokens; a { v: tokens.token("nope"); }', { loadPaths: [dirs[0]] })).toThrow("Unknown token");
    });

    describe("Figma profile (TDD tokens FG1-FG6)", () => {
      const leaves = (node, out = new Map()) => {
        for (const [key, value] of Object.entries(node)) {
          if (key.startsWith("$") || !value || typeof value !== "object") continue;
          if ("$value" in value) out.set(value.$extensions["com.scnehaux.ui"].cssName, value);
          else leaves(value, out);
        }
        return out;
      };

      it("writes one color file per mode with every Tier-2 color, as the sRGB-clipped value the gates measure", () => {
        for (const themeId of Object.keys(config.themes)) {
          const json = JSON.parse(read(`tokens/json/${themeId}.json`));
          const colors = json.tokens.filter((t) => t.type === "color" && t.tier === 2);
          const keySets = [];
          for (const mode of json.modes) {
            const tokens = leaves(JSON.parse(read(`tokens/figma/${themeId}.${mode}.color.tokens.json`)));
            keySets.push([...tokens.keys()].sort());
            expect(tokens.size).toBe(colors.length);
            for (const record of colors) {
              const token = tokens.get(record.cssName);
              expect(token.$type).toBe("color");
              const { colorSpace, components, alpha = 1, hex } = token.$value;
              expect(colorSpace).toBe("srgb");
              expect(hex).toMatch(/^#[0-9a-f]{6}$/);
              const source = parseColor(record.resolved[themeId][mode]);
              expect(alpha).toBeCloseTo(Number(source.alpha ?? 1), 4);
              // The exported value is the srgb-clip display path the contrast gate measures;
              // PG6 bounds its distance to the CSS gamut-mapped rendering (plus 4-decimal rounding).
              const opaque = source.clone();
              opaque.alpha = 1;
              const exported = parseColor(`color(srgb ${components.join(" ")})`);
              const mapped = opaque.clone().toGamut({ space: "srgb", method: "css" });
              expect(mapped.deltaE(exported, "OK")).toBeLessThanOrEqual(0.0201);
              expect(token.$extensions["com.scnehaux.ui"].codeSyntax.WEB).toBe(`var(${record.cssName})`);
            }
          }
          // FG2: Figma imports only tokens present in every file of a collection.
          for (const keys of keySets) expect(keys).toEqual(keySets[0]);
        }
      });

      it("writes every dimension once per theme, in pixels", () => {
        for (const themeId of Object.keys(config.themes)) {
          const json = JSON.parse(read(`tokens/json/${themeId}.json`));
          const dims = json.tokens.filter((t) => t.tier === 2 && t.name.startsWith("dimension."));
          const tokens = leaves(JSON.parse(read(`tokens/figma/${themeId}.dimension.tokens.json`)));
          expect(tokens.size).toBe(dims.length);
          for (const record of dims) expect(tokens.get(record.cssName).$value).toBe(pixelValue(record.resolved[themeId][json.modes[0]]));
        }
      });

      it("converts lengths to pixels and colors to clipped sRGB", () => {
        expect(pixelValue("0.375rem")).toBe(6);
        expect(pixelValue("9999px")).toBe(9999);
        expect(pixelValue("1040")).toBe(1040);
        expect(() => pixelValue("calc(1px + 1rem)")).toThrow("no pixel value");
        expect(srgbValue("oklch(0.6 0.3 260)").components.every((c) => c >= 0 && c <= 1)).toBe(true);
        expect(srgbValue("oklch(0 0 0 / 0.42)")).toEqual({ colorSpace: "srgb", components: [0, 0, 0], hex: "#000000", alpha: 0.42 });
      });
    });
  });
});
