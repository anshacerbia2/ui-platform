/**
 * sRGB Gamut Boundary & Binary Search Mapper
 *
 * Implements CSS Color Module Level 4 gamut mapping:
 * For a given OKLCH (L, C, H), if C pushes the color
 * outside the sRGB gamut, binary-search C downward until
 * the color is representable — preserving L and H exactly.
 *
 * @remarks
 * This is the industry-standard approach used by browsers
 * and Color.js. It preserves perceived lightness and hue
 * while reducing only chroma (saturation) — the least
 * perceptually disruptive adjustment.
 */

import { oklchToSrgb } from './oklch-math.mjs';

/**
 * Checks if an OKLCH color is within the sRGB gamut.
 * Converts to sRGB and verifies all channels are in [0, 1].
 *
 * @param {number} L - Lightness.
 * @param {number} C - Chroma.
 * @param {number} H - Hue degrees.
 * @param {number} tolerance - Acceptable overshoot for
 *   floating-point precision (default 0.001).
 * @returns {boolean} True if the color is in sRGB gamut.
 */
export function isInSrgbGamut(L, C, H, tolerance = 0.001) {
  const [r, g, b] = oklchToSrgb(L, C, H);
  return (
    r >= -tolerance && r <= 1 + tolerance &&
    g >= -tolerance && g <= 1 + tolerance &&
    b >= -tolerance && b <= 1 + tolerance
  );
}

/**
 * Maps an OKLCH color into the sRGB gamut by binary-searching
 * the chroma axis downward. Lightness and hue are preserved exactly.
 *
 * Uses the CSS Color Level 4 specification approach:
 * binary search on C with convergence threshold epsilon.
 *
 * @param {number} L - Lightness [0, 1].
 * @param {number} C - Desired chroma.
 * @param {number} H - Hue degrees [0, 360).
 * @param {number} epsilon - Convergence threshold (default 0.0005).
 * @param {number} maxIter - Maximum iterations (default 32).
 * @returns {[number, number, number]} Gamut-mapped [L, C, H].
 */
export function gamutMapToSrgb(L, C, H, epsilon = 0.0005, maxIter = 32) {
  // Early exit: achromatic or already in gamut
  if (C <= 0) return [L, 0, H];
  if (isInSrgbGamut(L, C, H)) return [L, C, H];

  let lo = 0;
  let hi = C;

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    if (hi - lo < epsilon) break;

    if (isInSrgbGamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return [L, lo, H];
}

/**
 * Finds the maximum representable chroma for a given
 * lightness and hue within the sRGB gamut.
 *
 * Useful for visualization and scale planning to understand
 * the "chroma ceiling" at each lightness level.
 *
 * @param {number} L - Lightness [0, 1].
 * @param {number} H - Hue degrees [0, 360).
 * @param {number} epsilon - Precision (default 0.001).
 * @returns {number} Maximum chroma in sRGB gamut.
 */
export function maxChromaInSrgb(L, H, epsilon = 0.001) {
  let lo = 0;
  let hi = 0.4; // OKLCH chroma theoretical max

  while (hi - lo > epsilon) {
    const mid = (lo + hi) / 2;
    if (isInSrgbGamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return lo;
}

// ── P3 Gamut Mapping ──────────────────────────────────────────────────

import { oklchToLinearP3 } from './oklch-math.mjs';

/**
 * Checks if an OKLCH color is within the Display P3 gamut.
 */
export function isInP3Gamut(L, C, H, tolerance = 0.001) {
  const [r, g, b] = oklchToLinearP3(L, C, H);
  return (
    r >= -tolerance && r <= 1 + tolerance &&
    g >= -tolerance && g <= 1 + tolerance &&
    b >= -tolerance && b <= 1 + tolerance
  );
}

/**
 * Maps an OKLCH color into the Display P3 gamut using binary search.
 */
export function gamutMapToP3(L, C, H, epsilon = 0.0005, maxIter = 32) {
  if (C <= 0) return [L, 0, H];
  if (isInP3Gamut(L, C, H)) return [L, C, H];

  let lo = 0;
  let hi = C;

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    if (hi - lo < epsilon) break;

    if (isInP3Gamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return [L, lo, H];
}

/**
 * Finds the maximum representable chroma within the Display P3 gamut.
 */
export function maxChromaInP3(L, H, epsilon = 0.001) {
  let lo = 0;
  let hi = 0.4;

  while (hi - lo > epsilon) {
    const mid = (lo + hi) / 2;
    if (isInP3Gamut(L, mid, H)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return lo;
}
