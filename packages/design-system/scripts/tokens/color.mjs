// Color evaluation for the contrast gate (TDD tokens, "CSS and visual
// validation"): alpha colors are composited on their actual background before
// the WCAG 2.x contrast ratio is computed. Colors outside sRGB are mapped with
// the CSS Color 4 gamut-mapping algorithm, as a browser displays them.

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

function toSrgb(color) {
  return color.clone().toGamut({ space: "srgb" }).to("srgb");
}

/**
 * Composite `foreground` over an opaque `background` in gamma-encoded sRGB,
 * the space browsers blend in. Returns an opaque sRGB color.
 */
export function composite(foreground, background) {
  const fg = toSrgb(foreground);
  const bg = toSrgb(background);
  const alpha = Number(fg.alpha ?? 1);
  if (Number(bg.alpha ?? 1) < 1) throw new Error("background must be opaque; composite it on the canvas first");
  const coords = fg.coords.map((channel, i) => (channel ?? 0) * alpha + (bg.coords[i] ?? 0) * (1 - alpha));
  return new Color("srgb", coords, 1);
}

/** Make a background opaque by compositing it on the canvas when needed. */
export function opaqueOn(background, canvas) {
  return Number(background.alpha ?? 1) < 1 ? composite(background, canvas) : toSrgb(background);
}

/** WCAG 2.x contrast ratio of a (possibly translucent) foreground on a background. */
export function contrastRatio(foreground, background, canvas) {
  const bg = opaqueOn(background, canvas);
  const fg = composite(foreground, bg);
  return fg.contrast(bg, "WCAG21");
}
