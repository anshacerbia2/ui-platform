// Palette engine (TDD tokens, "Palette generation"): shape from the Radix
// custom-palette algorithm (radix.mjs) with the reference scales' hue drift
// kept for chromatic scales, then the constraints of this
// platform, measured with the token gate's own contrast function on its four
// display paths (scripts/tokens/color.mjs), so the generator and the gate
// cannot disagree about a ratio.
//
//   PG3  steps 9 (solid), 10 (hover), and 10B (pressed) are one ramp shared by
//        both modes: 9 is the seed, moved only as far as the label needs; 10
//        and 10B step away from the label; the label meets the text minimum
//        on all three.
//   PG11 a `contrast` scale (neutral) fills with its own step 12 and labels
//        with its step 1 in each mode, as Radix Themes' high-contrast solid
//        does; at that end of the lightness range hover and pressed step
//        toward the label, and the label still meets the text minimum.
//   PG4  steps 11 and 12 meet the text minimum on every neutral surface of the
//        mode and on steps 1-5 of their own scale.
//   PG5  neutral step 8, the control boundary, meets the non-text minimum on
//        every neutral surface of the mode.
//   PG6  every color is in Display P3 and its sRGB-clipped rendering stays
//        within the configured OKLab distance of its gamut-mapped rendering.

import Color from "colorjs.io";
import { contrastRatio } from "../tokens/color.mjs";
import {
  REFERENCE,
  alphaOver,
  hueOf,
  interactionStep,
  limitTextChroma,
  scaleFromSeed,
} from "./radix.mjs";

const CONFIG_KEYS = {
  root: [
    "$comment",
    "schemaVersion",
    "reference",
    "backgrounds",
    "neutral",
    "hues",
    "surfaces",
    "targets",
    "precision",
  ],
  reference: ["package", "version", "variant"],
  backgrounds: ["light", "dark"],
  hue: ["seed", "label"],
  surfaces: ["$comment", "light", "dark"],
  targets: ["margin", "disabledFloor", "srgbClipDeltaE"],
  precision: ["lightness", "chroma", "hue", "alpha"],
};

/** Reject unknown or missing configuration keys (TDD tokens, "Configuration"). */
export function validateConfig(config) {
  const errors = [];
  const exact = (object, keys, where, optional = ["$comment"]) => {
    if (!object || typeof object !== "object")
      return errors.push(`${where}: missing`);
    for (const key of Object.keys(object))
      if (!keys.includes(key)) errors.push(`${where}: unknown key "${key}"`);
    for (const key of keys)
      if (!optional.includes(key) && !(key in object))
        errors.push(`${where}: missing key "${key}"`);
  };
  exact(config, CONFIG_KEYS.root, "config");
  if (config?.schemaVersion !== 1)
    errors.push("config: schemaVersion must be 1");
  exact(config?.reference, CONFIG_KEYS.reference, "reference");
  exact(config?.backgrounds, CONFIG_KEYS.backgrounds, "backgrounds");
  exact(config?.neutral, CONFIG_KEYS.hue, "neutral");
  for (const [name, hue] of Object.entries(config?.hues ?? {})) {
    if (!/^[a-z]+$/.test(name))
      errors.push(`hues.${name}: a hue name is lowercase letters`);
    if (["white", "black", "neutral"].includes(name))
      errors.push(`hues.${name}: reserved name`);
    exact(hue, CONFIG_KEYS.hue, `hues.${name}`);
  }
  for (const [where, hue] of [
    ["neutral", config?.neutral],
    ...Object.entries(config?.hues ?? {}).map(([n, h]) => [`hues.${n}`, h]),
  ]) {
    if (hue && !["light", "dark", "contrast"].includes(hue.label))
      errors.push(`${where}.label: "light", "dark", or "contrast"`);
    try {
      new Color(hue?.seed);
    } catch {
      errors.push(`${where}.seed: not a CSS color`);
    }
  }
  exact(config?.surfaces, CONFIG_KEYS.surfaces, "surfaces");
  exact(config?.targets, CONFIG_KEYS.targets, "targets");
  exact(config?.precision, CONFIG_KEYS.precision, "precision");
  return errors;
}

const MODES = ["light", "dark"];
/** Direction that moves away from a mode's background in lightness. */
const AWAY = { light: -1, dark: 1 };
const WHITE = new Color("oklch", [1, 0, 0]);

const oklch = (color) => color.to("oklch");
const withL = (color, l) =>
  new Color("oklch", [
    Math.max(0, Math.min(1, l)),
    color.coords[1] || 0,
    hueOf(color),
  ]);
const withC = (color, c) =>
  new Color("oklch", [color.coords[0], c, hueOf(color)]);

/** WCAG 2.x ratio, the lowest over the gate's four display paths. */
export const ratio = (fg, bg) => contrastRatio(fg, bg, bg).ratio;

/** OKLab distance between the sRGB-clipped and the sRGB gamut-mapped rendering. */
export function clipDistortion(color) {
  const clipped = color.clone().to("srgb").toGamut({ method: "clip" });
  const mapped = color.clone().toGamut({ space: "srgb", method: "css" });
  return clipped.deltaEOK(mapped);
}

/** PG6: into Display P3 by CSS gamut mapping, then chroma down until the sRGB clip distortion is within budget. */
export function fitGamut(color, budget) {
  const source = oklch(color.clone());
  // An in-gamut color is kept as is; mapping is chroma reduction at constant
  // lightness and hue (CSS Color 4), so the hue is restored exactly.
  let fitted = source.inGamut("p3")
    ? source
    : withC(
        source,
        oklch(source.clone().toGamut({ space: "p3", method: "css" })).coords[1],
      );
  if (fitted.inGamut("srgb") || clipDistortion(fitted) <= budget) return fitted;
  let low = 0;
  let high = fitted.coords[1];
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (clipDistortion(withC(fitted, mid)) <= budget) low = mid;
    else high = mid;
  }
  return withC(fitted, low);
}

/** Round to the emitted precision; the emitted value is what every constraint is verified on. */
export function quantize(color, precision) {
  const round = (value, digits) => Number(value.toFixed(digits));
  const l = round(color.coords[0], precision.lightness);
  const h = round(hueOf(color), precision.hue);
  const unit = 10 ** -precision.chroma;
  // Rounding can step just outside Display P3; give back chroma one unit at a time.
  let c = round(color.coords[1] || 0, precision.chroma);
  while (c > 0 && !new Color("oklch", [l, c, h]).inGamut("p3"))
    c = round(c - unit, precision.chroma);
  return new Color("oklch", [l, c, c === 0 ? 0 : h]);
}

/**
 * Smallest move of lightness in `direction` after which `holds(color)` is
 * true. Throws when even the end of the lightness range does not satisfy it.
 */
function moveUntil(color, direction, holds, fit, what) {
  const start = fit(color);
  if (holds(start)) return start;
  const range = direction < 0 ? color.coords[0] : 1 - color.coords[0];
  const at = (t) => fit(withL(color, color.coords[0] + direction * t));
  if (!holds(at(range)))
    throw new Error(
      `${what}: no lightness in direction ${direction} satisfies the constraint`,
    );
  let low = 0;
  let high = range;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (holds(at(mid))) high = mid;
    else low = mid;
  }
  return at(high);
}

/**
 * Generate every Tier-1 color scale. Returns
 * { scales: { [hue]: { light: Color[13], dark: Color[13] } }, labels, report }
 * where index 0-11 are steps 1-12 and index 12 is step 10B.
 */
export function generate(config, contrast) {
  const errors = validateConfig(config);
  if (errors.length)
    throw new Error(`palette config:\n  ${errors.join("\n  ")}`);
  const { margin, srgbClipDeltaE: budget, disabledFloor } = config.targets;
  const text = contrast.textMinimum;
  const nonText = contrast.nonTextMinimum;
  const fit = (color) => quantize(fitGamut(color, budget), config.precision);
  const backgrounds = Object.fromEntries(
    MODES.map((mode) => [mode, new Color(config.backgrounds[mode])]),
  );
  const hues = [
    ["neutral", { ...config.neutral, gray: true }],
    ...Object.entries(config.hues),
  ];
  const scales = {};
  const report = { hues: {} };

  // Shape (PG2): Radix's custom-palette scale for each seed and mode.
  for (const [name, hue] of hues) {
    scales[name] = {};
    for (const mode of MODES) {
      const reference = hue.gray ? REFERENCE[mode].gray : REFERENCE[mode].all;
      const shape = scaleFromSeed(
        new Color(hue.seed),
        reference,
        backgrounds[mode],
        mode,
        { hueDrift: !hue.gray },
      );
      scales[name][mode] = limitTextChroma(shape, new Color(hue.seed)).map(fit);
    }
  }

  const surfaces = (mode) =>
    config.surfaces[mode].map((s) =>
      s === "white" ? WHITE : scales.neutral[mode][s - 1],
    );
  const minOn = (fg, bgs) => Math.min(...bgs.map((bg) => ratio(fg, bg)));
  // The label on a solid fill (PG3, PG11): white, neutral step 12 of the light
  // axis, or for a contrast scale neutral step 1 of the mode.
  const labelOf = (hue, mode) =>
    hue.label === "light"
      ? WHITE
      : hue.label === "dark"
        ? scales.neutral.light[11]
        : scales.neutral[mode][0];

  // Neutral first: every other scale is measured on its surfaces.
  for (const [name, hue] of hues) {
    const entry = (report.hues[name] = {
      seed: new Color(hue.seed).to("oklch").toString({ precision: 4 }),
      label: hue.label,
      modes: {},
    });

    // PG5: the control boundary.
    if (name === "neutral") {
      for (const mode of MODES) {
        const bgs = surfaces(mode);
        scales.neutral[mode][7] = moveUntil(
          scales.neutral[mode][7],
          AWAY[mode],
          (c) => minOn(c, bgs) >= nonText + margin,
          fit,
          `neutral/${mode}/8`,
        );
      }
    }

    // PG4: text steps 11 and 12.
    for (const mode of MODES) {
      const scale = scales[name][mode];
      const bgs = [...surfaces(mode), ...scale.slice(0, 5)];
      scale[10] = moveUntil(
        scale[10],
        AWAY[mode],
        (c) => minOn(c, bgs) >= text + margin,
        fit,
        `${name}/${mode}/11`,
      );
      // Step 12 stays at least as far from the background as step 11.
      const past11 = (c) =>
        AWAY[mode] * (c.coords[0] - scale[10].coords[0]) >= 0.02;
      scale[11] = moveUntil(
        scale[11],
        AWAY[mode],
        (c) => minOn(c, bgs) >= text + margin && past11(c),
        fit,
        `${name}/${mode}/12`,
      );
    }

    if (hue.label === "contrast") {
      // PG11: step 12 of each mode is the fill; hover and pressed step toward
      // the label, because the fill already sits at the end of the range.
      entry.key = {};
      for (const mode of MODES) {
        const label = labelOf(hue, mode);
        const toward = -AWAY[mode];
        const fill = scales[name][mode][11];
        const hover = fit(interactionStep(fill, toward));
        const pressed = fit(interactionStep(hover, toward));
        for (const state of [fill, hover, pressed]) {
          if (ratio(label, state) < text + margin)
            throw new Error(`${name}/${mode}/solid: the contrast ramp leaves its label below ${text + margin}:1`);
        }
        scales[name][mode][8] = fill;
        scales[name][mode][9] = hover;
        scales[name][mode][12] = pressed;
        entry.key[mode] = fill.coords[0];
      }
      continue;
    }

    // PG3: the solid ramp. Hover and pressed step away from the label, so the
    // label's contrast never drops below the fill's, and the ramp is the same
    // in both modes.
    const label = labelOf(hue);
    const awayFromLabel = hue.label === "light" ? -1 : 1;
    const ramp = (fill) => {
      const hover = fit(interactionStep(fill, awayFromLabel));
      return [fill, hover, fit(interactionStep(hover, awayFromLabel))];
    };
    const seed = fit(new Color(hue.seed));
    const labelHolds = (fill) =>
      ramp(fill).every((state) => ratio(label, state) >= text + margin);
    const key = moveUntil(
      seed,
      awayFromLabel,
      labelHolds,
      fit,
      `${name}/solid`,
    );
    const [fill, hover, pressed] = ramp(key);
    for (const mode of MODES) {
      scales[name][mode][8] = fill;
      scales[name][mode][9] = hover;
      scales[name][mode][12] = pressed;
    }
    entry.key = { seedL: seed.coords[0], keyL: key.coords[0] };
  }

  // Verification of the emitted values, independent of the solving order.
  const failures = [];
  for (const [name, hue] of hues) {
    for (const mode of MODES) {
      const scale = scales[name][mode];
      const bgs = [...surfaces(mode), ...scale.slice(0, 5)];
      const row = (report.hues[name].modes[mode] = {});
      row.text11 = minOn(scale[10], bgs);
      row.text12 = minOn(scale[11], bgs);
      row.label = Math.min(
        ...[8, 9, 12].map((i) => ratio(labelOf(hue, mode), scale[i])),
      );
      row.disabledLabel = ratio(scales.neutral[mode][7], scale[2]);
      if (row.text11 < text || row.text12 < text)
        failures.push(`${name}/${mode}: text below ${text}:1`);
      if (row.label < text)
        failures.push(`${name}/${mode}: solid label below ${text}:1`);
      if (row.disabledLabel < disabledFloor)
        failures.push(
          `${name}/${mode}: disabled label below ${disabledFloor}:1 (TDD tokens SD2)`,
        );
      for (let i = 1; i < 8; i++) {
        if (AWAY[mode] * (scale[i].coords[0] - scale[i - 1].coords[0]) <= 0)
          failures.push(
            `${name}/${mode}: steps ${i} and ${i + 1} are not ordered away from the background`,
          );
      }
      for (const [i, color] of scale.entries()) {
        if (!color.inGamut("p3"))
          failures.push(`${name}/${mode}/${stepName(i)}: outside Display P3`);
        if (!color.inGamut("srgb") && clipDistortion(color) > budget + 1e-4)
          failures.push(
            `${name}/${mode}/${stepName(i)}: sRGB clip distortion above ${budget}`,
          );
      }
    }
    // The ramp is shared by both modes, except a contrast scale's (PG11).
    for (const i of hue.label === "contrast" ? [] : [8, 9, 12]) {
      if (
        scales[name].light[i].coords.some(
          (v, j) => v !== scales[name].dark[i].coords[j],
        )
      )
        failures.push(`${name}: step ${stepName(i)} differs between modes`);
    }
  }
  const boundary = MODES.map((mode) =>
    minOn(scales.neutral[mode][7], surfaces(mode)),
  );
  report.boundary = { light: boundary[0], dark: boundary[1] };
  boundary.forEach(
    (value, i) =>
      value < nonText &&
      failures.push(
        `neutral/${MODES[i]}/8: control boundary below ${nonText}:1`,
      ),
  );
  if (failures.length)
    throw new Error(`palette constraints:\n  ${failures.join("\n  ")}`);

  // PG7, alpha steps: each step as a translucent color that composites to the
  // step over neutral step 1 of its mode, the baseline ADR-UIP-TKN-002 4.2
  // declares (Radix solves over its page background).
  const alphas = {};
  for (const [name] of hues) {
    alphas[name] = {};
    for (const mode of MODES) {
      alphas[name][mode] = scales[name][mode].slice(0, 12).map((color) => {
        const [r, g, b, a] = alphaOver(color, scales.neutral[mode][0]);
        return {
          color: quantize(
            new Color("srgb", [r, g, b]).to("oklch"),
            config.precision,
          ),
          alpha: Number(a.toFixed(config.precision.alpha)),
        };
      });
    }
  }

  const labels = Object.fromEntries(
    hues.map(([name, hue]) => [name, hue.label]),
  );
  return { scales, alphas, labels, report };
}

/** Tier-1 step key of a scale index: 1-12, then 10B. */
export const stepName = (index) => (index === 12 ? "10B" : String(index + 1));
