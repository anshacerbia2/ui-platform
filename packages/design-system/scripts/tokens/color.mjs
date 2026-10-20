// Color evaluation for the contrast gate (TDD tokens, "CSS and visual
// validation"): alpha colors are composited on their actual background before
// the WCAG 2.x contrast ratio is computed. A color outside sRGB is evaluated on
// every display path a supported browser can take, and the lowest ratio counts
// (STD-UIP-TKN-001 2.3.0; TDD tokens G1-G3): CSS Color 4 specifies gamut
// mapping, while Chromium and Firefox were measured to clip.

import Color from "colorjs.io";

/** Parse a resolved CSS color value; returns null when it is not a color. */
export function parseColor(css) {
  try {
    return new Color(css);
  } catch {
    return null;
  }
}

export function inSrgbGamut(color) {
  return color.clone().to("srgb").inGamut("srgb");
}

/** Display paths: the display's color space and how an out-of-gamut color reaches it. */
export const DISPLAY_PATHS = [
  { name: "srgb-clip", space: "srgb", method: "clip" },
  { name: "srgb-map", space: "srgb", method: "css" },
  { name: "p3-clip", space: "p3", method: "clip" },
  { name: "p3-map", space: "p3", method: "css" },
];
const SRGB_MAP = DISPLAY_PATHS[1];

/** The color as a display of `path` shows it. */
export function onDisplay(color, path) {
  return path.method === "clip"
    ? color.clone().to(path.space).toGamut({ method: "clip" })
    : color.clone().toGamut({ space: path.space, method: "css" }).to(path.space);
}

/**
 * Composite `foreground` over an opaque `background` in the gamma-encoded
 * space of the display path (sRGB by default). Returns an opaque color.
 */
export function composite(foreground, background, path = SRGB_MAP) {
  const fg = onDisplay(foreground, path);
  const bg = onDisplay(background, path);
  const alpha = Number(fg.alpha ?? 1);
  if (Number(bg.alpha ?? 1) < 1) throw new Error("background must be opaque; composite it on the canvas first");
  const coords = fg.coords.map((channel, i) => (channel ?? 0) * alpha + (bg.coords[i] ?? 0) * (1 - alpha));
  return new Color(path.space, coords, 1);
}

/** Make a background opaque by compositing it on the canvas when needed. */
export function opaqueOn(background, canvas, path = SRGB_MAP) {
  return Number(background.alpha ?? 1) < 1 ? composite(background, canvas, path) : onDisplay(background, path);
}

/**
 * WCAG 2.x contrast ratio of a (possibly translucent) foreground on a
 * background, on each display path. Relative luminance is taken in the
 * path's color space (WCAG 2.2, "relative luminance").
 */
export function contrastByPath(foreground, background, canvas) {
  return DISPLAY_PATHS.map((path) => {
    const bg = opaqueOn(background, canvas, path);
    const fg = composite(foreground, bg, path);
    return { path: path.name, ratio: fg.contrast(bg, "WCAG21") };
  });
}

/** The lowest ratio over every display path, and the path it occurs on. */
export function contrastRatio(foreground, background, canvas) {
  return contrastByPath(foreground, background, canvas).reduce((low, next) => (next.ratio < low.ratio ? next : low));
}
