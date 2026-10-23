// Scale shape from a seed color: a port of the Radix Colors custom-palette
// generator (TDD tokens, "Palette generation", PG2).
//
// Source: radix-ui/website `components/generate-radix-colors.tsx` at commit
// 402e749613ab2e7ab7139c65b0029842b0360f07, MIT License, Copyright (c) 2022
// WorkOS. Reference scales: @radix-ui/colors 3.0.0 (MIT), the Display P3
// variants. The port keeps the algorithm: mix the two reference scales nearest
// to the seed, rotate hue and scale chroma to the seed, then move the
// lightness progression to the mode's background. It returns only the shape;
// steps 9 and 10, text contrast, and gamut are this repository's (solve.mjs).

import Color from "colorjs.io";
import * as RadixColors from "@radix-ui/colors";
import { cubicBezier } from "./bezier.mjs";

const GRAY_SCALES = ["gray", "mauve", "slate", "sage", "olive", "sand"];
const ACCENT_SCALES = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "brown",
  "orange",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
];

const load = (name, dark) =>
  Object.values(RadixColors[`${name}${dark ? "Dark" : ""}P3`]).map((value) =>
    new Color(value).to("oklch"),
  );
const table = (names, dark) =>
  Object.fromEntries(names.map((name) => [name, load(name, dark)]));

/** Reference scales by mode: all scales, and the gray scales alone. */
export const REFERENCE = {
  light: {
    all: table([...GRAY_SCALES, ...ACCENT_SCALES], false),
    gray: table(GRAY_SCALES, false),
  },
  dark: {
    all: table([...GRAY_SCALES, ...ACCENT_SCALES], true),
    gray: table(GRAY_SCALES, true),
  },
};

// Radix's lightness easings for moving the progression start to the background.
const LIGHT_EASING = [0, 2, 0, 2];
const DARK_EASING = [1, 0, 1, 0];

/** Hue of an OKLCH color, 0 when it is achromatic (colorjs.io reports none as NaN or null). */
export const hueOf = (color) =>
  Number.isFinite(color.coords[2]) ? color.coords[2] : 0;

function transposeProgressionStart(to, values, curve) {
  const ease = cubicBezier(...curve);
  const last = values.length - 1;
  const diff = values[0] - to;
  return values.map((n, i) => n - diff * ease(1 - i / last));
}

/**
 * The 12-step shape for `seed` against `background` in `mode`, from the
 * reference scales `scales` (REFERENCE[mode].all or .gray). Returns OKLCH
 * colors; no step is constrained yet.
 */
export function scaleFromSeed(
  seed,
  scales,
  background,
  mode,
  { hueDrift = false } = {},
) {
  const source = seed.to("oklch");
  const candidates = [];
  for (const [scale, colors] of Object.entries(scales)) {
    for (const color of colors)
      candidates.push({ scale, color, distance: source.deltaEOK(color) });
  }
  candidates.sort((a, b) => a.distance - b.distance);
  // The nearest color of each scale.
  const closest = candidates.filter(
    (c, i, all) => i === all.findIndex((other) => other.scale === c.scale),
  );
  // Grays sit close together, so a second gray adds no direction (Radix).
  const allGray = closest.every((c) => GRAY_SCALES.includes(c.scale));
  if (!allGray && GRAY_SCALES.includes(closest[0].scale)) {
    while (GRAY_SCALES.includes(closest[1].scale)) closest.splice(1, 1);
  }
  const [colorA, colorB] = closest;

  // Mix the two nearest scales in the proportion of the source's projection on
  // the segment between them; an obtuse triangle means scale A alone (Radix).
  const a = colorB.distance;
  const b = colorA.distance;
  const c = colorA.color.deltaEOK(colorB.color);
  let ratio = 0;
  // A seed equal to a reference color (b = 0) is that scale; Radix's formula is 0/0 there.
  if (b > 1e-9 && c > 1e-9) {
    const cosA = (b ** 2 + c ** 2 - a ** 2) / (2 * b * c);
    const cosB = (a ** 2 + c ** 2 - b ** 2) / (2 * a * c);
    const tanC1 = cosA / Math.sin(Math.acos(cosA));
    const tanC2 = cosB / Math.sin(Math.acos(cosB));
    ratio = Math.max(0, tanC1 / tanC2) * 0.5;
    if (!Number.isFinite(ratio)) ratio = 0;
  }
  const scaleA = scales[colorA.scale];
  const scaleB = scales[colorB.scale];
  const scale = scaleA.map((color, i) =>
    new Color(Color.mix(color, scaleB[i], ratio)).to("oklch"),
  );

  // Rotate hue and scale chroma so the nearest step matches the seed. Radix
  // sets every step to the seed's hue; with `hueDrift` each step keeps the
  // reference scale's hue offset from that nearest step instead, the drift the
  // hand-tuned Radix scales carry (darker yellows turn toward amber, PG2).
  const base = [...scale].sort(
    (x, y) => source.deltaEOK(x) - source.deltaEOK(y),
  )[0];
  const ratioC = base.coords[1] > 0 ? source.coords[1] / base.coords[1] : 1;
  const baseHue = hueOf(base);
  for (const color of scale) {
    const drift = hueDrift ? ((hueOf(color) - baseHue + 540) % 360) - 180 : 0;
    color.coords[1] = Math.min(
      source.coords[1] * 1.5,
      color.coords[1] * ratioC,
    );
    color.coords[2] = (hueOf(source) + drift + 360) % 360;
  }

  const backgroundL = Math.max(
    0,
    Math.min(1, background.to("oklch").coords[0]),
  );
  const lightness = scale.map((color) => color.coords[0]);
  if (mode === "light") {
    // White is prepended as a step so the background moves the start (Radix).
    const moved = transposeProgressionStart(
      backgroundL,
      [1, ...lightness],
      LIGHT_EASING,
    );
    moved.shift();
    moved.forEach((l, i) => (scale[i].coords[0] = l));
    return scale;
  }
  // Dark mode: a background lighter than step 1 eases toward linear (Radix).
  const ease = [...DARK_EASING];
  const ratioL = backgroundL / lightness[0];
  if (ratioL > 1) {
    const maxRatio = 1.5;
    for (let i = 0; i < ease.length; i++) {
      const metaRatio = (ratioL - 1) * (maxRatio / (maxRatio - 1));
      ease[i] = ratioL > maxRatio ? 0 : Math.max(0, ease[i] * (1 - metaRatio));
    }
  }
  transposeProgressionStart(backgroundL, lightness, ease).forEach(
    (l, i) => (scale[i].coords[0] = l),
  );
  return scale;
}

/**
 * Radix limits the chroma of the text steps (11, 12) to the larger chroma of
 * step 8 and the solid fill (the seed), so text never out-saturates the fill.
 */
export function limitTextChroma(scale, seed) {
  const cap = Math.max(seed.to("oklch").coords[1], scale[7].coords[1]);
  for (const i of [10, 11])
    scale[i].coords[1] = Math.min(cap, scale[i].coords[1]);
  return scale;
}

/**
 * One interaction step from a solid fill, Radix's button-hover rule:
 * lightness moves by 0.03 / (L + 0.1), and chroma drops 7% when the fill
 * darkens. `direction` is -1 (darker) or +1 (lighter).
 */
export function interactionStep(color, direction) {
  const [l, c, h] = color.coords;
  const delta = 0.03 / (l + 0.1);
  const darker = direction < 0;
  return new Color("oklch", [
    l + direction * delta,
    darker && c > 0 ? c * 0.93 : c,
    Number.isFinite(h) ? h : 0,
  ]);
}

/**
 * Alpha color that composites over `background` to `target` in 8-bit sRGB,
 * with browser rounding (each channel's two terms rounded separately, Radix).
 * Radix lightens or darkens every channel together, so a target whose channels
 * move in both directions from the background (an orange over a blue-gray)
 * is out of reach; here the alpha is the smallest one at which every channel
 * is reachable, each channel solved on its own. Returns [r, g, b, a] in 0-1.
 */
export function alphaOver(target, background) {
  const P = 255;
  const toRgb = (color) =>
    color
      .to("srgb")
      .toGamut({ method: "clip" })
      .coords.map((v) => Math.round((v ?? 0) * P));
  const t = toRgb(target);
  const b = toRgb(background);
  const need = t.map((tc, i) =>
    tc > b[i] ? (tc - b[i]) / (P - b[i]) : tc < b[i] ? (b[i] - tc) / b[i] : 0,
  );
  const blend = (f, back, A) => Math.round(back * (1 - A)) + Math.round(f * A);
  for (
    let steps = Math.max(1, Math.ceil(Math.max(...need) * P - 1e-9));
    steps <= P;
    steps++
  ) {
    const A = steps / P;
    const fg = t.map((tc, i) => {
      const exact = (tc - b[i] * (1 - A)) / A;
      // The rounded channel nearest the exact one whose blend hits the target.
      const candidates = [
        Math.floor(exact),
        Math.ceil(exact),
        Math.floor(exact) - 1,
        Math.ceil(exact) + 1,
      ].map((v) => Math.min(P, Math.max(0, v)));
      return candidates.reduce((best, v) =>
        Math.abs(blend(v, b[i], A) - tc) < Math.abs(blend(best, b[i], A) - tc)
          ? v
          : best,
      );
    });
    if (fg.every((f, i) => blend(f, b[i], A) === t[i]))
      return [...fg.map((f) => f / P), A];
  }
  return [...t.map((v) => v / P), 1];
}
