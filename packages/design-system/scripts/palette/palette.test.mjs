// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Color from "colorjs.io";
import { describe, expect, it } from "vitest";
import { cubicBezier } from "./bezier.mjs";
import { OUTPUT, render } from "./generate.mjs";
import {
  REFERENCE,
  interactionStep,
  limitTextChroma,
  scaleFromSeed,
} from "./radix.mjs";
import { clipDistortion, generate, ratio, validateConfig } from "./solve.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(here, file), "utf8"));
const config = read("palette.config.json");
const golden = read("fixtures/radix-golden.json");
const contrast = JSON.parse(
  fs.readFileSync(path.join(here, "../../tokens.config.json"), "utf8"),
).contrast;
const backgrounds = { light: new Color("#ffffff"), dark: new Color("#111111") };
const MODES = ["light", "dark"];

describe("Radix port (PG2)", () => {
  it("evaluates cubic-bezier easings like bezier-easing 2.1.0", () => {
    for (const { curve, values } of golden.bezier) {
      [0.1, 0.3, 0.5, 0.7, 0.9].forEach((x, i) =>
        expect(cubicBezier(...curve)(x)).toBeCloseTo(values[i], 6),
      );
    }
  });

  // Radix rounds lightness to 0.1% and chroma to 4 decimals in its output.
  const close = (actual, expected) => {
    const [l, c, h] = new Color(expected).coords;
    expect(Math.abs(actual.coords[0] - l)).toBeLessThan(0.0006);
    expect(Math.abs(actual.coords[1] - c)).toBeLessThan(0.0002);
    if (c > 0.001) expect(Math.abs(actual.coords[2] - h)).toBeLessThan(0.06);
  };

  for (const [name, seedValue] of Object.entries(golden.seeds)) {
    for (const mode of MODES) {
      it(`reproduces Radix's ${name} scale in ${mode} mode`, () => {
        const seed = new Color(seedValue);
        const reference =
          name === "neutral" ? REFERENCE[mode].gray : REFERENCE[mode].all;
        const shape = scaleFromSeed(seed, reference, backgrounds[mode], mode);
        const expected = golden.scales[name][mode];
        if (name === "neutral") {
          // Radix keeps the gray scale's own step 9 and 10.
          shape.forEach((color, i) => close(color, expected[i]));
          return;
        }
        limitTextChroma(shape, seed);
        for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 10, 11])
          close(shape[i], expected[i]);
        // Step 9 is the seed itself (colorjs.io 0.7 converts hex with more
        // precise OKLab matrices than the 0.5.2 Radix used); step 10 is Radix's
        // hover lightness.
        if (mode === "light")
          expect(
            Math.abs(
              interactionStep(new Color(expected[8]), -1).coords[0] -
                new Color(expected[9]).coords[0],
            ),
          ).toBeLessThan(0.0011);
      });
    }
  }
});

describe("hue drift (PG2)", () => {
  it("keeps the reference scale's hue offsets, so darker yellows turn toward amber", () => {
    const seed = new Color(config.hues.yellow.seed);
    const flat = scaleFromSeed(
      seed,
      REFERENCE.light.all,
      backgrounds.light,
      "light",
    );
    const drift = scaleFromSeed(
      seed,
      REFERENCE.light.all,
      backgrounds.light,
      "light",
      { hueDrift: true },
    );
    drift.forEach((color, i) => {
      expect(color.coords[0]).toBeCloseTo(flat[i].coords[0], 9);
      expect(color.coords[1]).toBeCloseTo(flat[i].coords[1], 9);
    });
    // Radix yellow 11 sits about 20 degrees toward orange from its step 9.
    expect(drift[10].coords[2] - drift[8].coords[2]).toBeLessThan(-10);
    expect(new Set(flat.map((c) => c.coords[2].toFixed(6))).size).toBe(1);
  });
});

describe("palette constraints (PG3-PG6)", () => {
  const { scales, report } = generate(config, contrast);
  const surfaces = (mode) =>
    config.surfaces[mode].map((s) =>
      s === "white"
        ? new Color("oklch", [1, 0, 0])
        : scales.neutral[mode][s - 1],
    );
  const hues = Object.keys(scales);

  it("puts every text step at the text minimum on every neutral surface and on steps 1-5 of its scale", () => {
    for (const name of hues) {
      for (const mode of MODES) {
        const scale = scales[name][mode];
        for (const bg of [...surfaces(mode), ...scale.slice(0, 5)]) {
          expect(ratio(scale[10], bg)).toBeGreaterThanOrEqual(
            contrast.textMinimum,
          );
          expect(ratio(scale[11], bg)).toBeGreaterThanOrEqual(
            contrast.textMinimum,
          );
        }
      }
    }
  });

  it("puts the control boundary (neutral 8) at the non-text minimum on every neutral surface", () => {
    for (const mode of MODES)
      for (const bg of surfaces(mode))
        expect(ratio(scales.neutral[mode][7], bg)).toBeGreaterThanOrEqual(
          contrast.nonTextMinimum,
        );
  });

  const labelOf = (name) =>
    name === "neutral" ? config.neutral.label : config.hues[name].label;

  it("shares one solid ramp between the modes, each state stepping away from its label", () => {
    for (const name of hues.filter((n) => labelOf(n) !== "contrast")) {
      const label = labelOf(name);
      const ink =
        label === "light"
          ? new Color("oklch", [1, 0, 0])
          : scales.neutral.light[11];
      const [fill, hover, pressed] = [8, 9, 12].map(
        (i) => scales[name].light[i],
      );
      for (const i of [8, 9, 12])
        expect(scales[name].dark[i].coords).toEqual(
          scales[name].light[i].coords,
        );
      expect(ratio(ink, fill)).toBeGreaterThanOrEqual(contrast.textMinimum);
      expect(ratio(ink, hover)).toBeGreaterThan(ratio(ink, fill));
      expect(ratio(ink, pressed)).toBeGreaterThan(ratio(ink, hover));
    }
  });

  it("fills a contrast scale with its step 12 under its step-1 label in each mode, hover and pressed stepping toward the label (PG11)", () => {
    expect(labelOf("neutral")).toBe("contrast");
    for (const mode of MODES) {
      const scale = scales.neutral[mode];
      const label = scale[0];
      const [fill, hover, pressed] = [8, 9, 12].map((i) => scale[i]);
      expect(fill.coords).toEqual(scale[11].coords);
      const toward = mode === "light" ? 1 : -1;
      expect(Math.sign(hover.coords[0] - fill.coords[0])).toBe(toward);
      expect(Math.sign(pressed.coords[0] - hover.coords[0])).toBe(toward);
      for (const state of [fill, hover, pressed])
        expect(ratio(label, state)).toBeGreaterThanOrEqual(contrast.textMinimum);
    }
    // Inverted between the modes: near-black in light, near-white in dark.
    expect(scales.neutral.light[8].coords[0]).toBeLessThan(0.3);
    expect(scales.neutral.dark[8].coords[0]).toBeGreaterThan(0.9);
  });

  it("keeps the brand seed when its label already passes", () => {
    expect(report.hues.blue.key.keyL).toBe(report.hues.blue.key.seedL);
  });

  it("keeps every color in Display P3 with the sRGB clip within budget, and steps 1-8 ordered away from the background", () => {
    for (const name of hues) {
      for (const mode of MODES) {
        const scale = scales[name][mode];
        for (const color of scale) {
          expect(color.inGamut("p3")).toBe(true);
          if (!color.inGamut("srgb"))
            expect(clipDistortion(color)).toBeLessThanOrEqual(
              config.targets.srgbClipDeltaE + 1e-4,
            );
        }
        for (let i = 1; i < 8; i++)
          expect(Math.sign(scale[i].coords[0] - scale[i - 1].coords[0])).toBe(
            mode === "light" ? -1 : 1,
          );
      }
    }
  });
});

describe("alpha steps (PG7)", () => {
  it("composite over neutral step 1 to the opaque step in 8-bit sRGB", () => {
    const { scales, alphas } = generate(config, contrast);
    const bytes = (color) =>
      color
        .to("srgb")
        .toGamut({ method: "clip" })
        .coords.map((v) => Math.round(v * 255));
    for (const name of Object.keys(scales)) {
      for (const mode of MODES) {
        const base = bytes(scales.neutral[mode][0]);
        alphas[name][mode].forEach(({ color, alpha }, i) => {
          const fg = bytes(color);
          const blended = fg.map(
            (f, k) => Math.round(base[k] * (1 - alpha)) + Math.round(f * alpha),
          );
          bytes(scales[name][mode][i]).forEach((target, k) =>
            expect(Math.abs(blended[k] - target)).toBeLessThanOrEqual(1),
          );
        });
      }
    }
  });
});

describe("generator contract (PG1, PG8)", () => {
  it("is deterministic and matches the committed generated module", () => {
    const first = render(config, contrast).text;
    expect(render(config, contrast).text).toBe(first);
    expect(fs.readFileSync(OUTPUT, "utf8")).toBe(first);
  });

  it("rejects unknown keys, missing keys, bad seeds, and reserved names", () => {
    expect(validateConfig({ ...config, extra: 1 })).toContain(
      'config: unknown key "extra"',
    );
    expect(
      validateConfig({
        ...config,
        hues: { ...config.hues, red: { seed: "nope", label: "light" } },
      }),
    ).toContain("hues.red.seed: not a CSS color");
    expect(
      validateConfig({
        ...config,
        hues: { ...config.hues, neutral: { seed: "#000", label: "light" } },
      }),
    ).toContain("hues.neutral: reserved name");
    const { precision, ...missing } = config;
    expect(validateConfig(missing)).toContain(
      'config: missing key "precision"',
    );
  });

  it("fails instead of writing when a constraint cannot hold", () => {
    expect(() =>
      generate(
        { ...config, targets: { ...config.targets, margin: 30 } },
        contrast,
      ),
    ).toThrow(/no lightness/);
  });
});
