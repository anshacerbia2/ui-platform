/**
 * APCA (Advanced Perceptual Contrast Algorithm) Calculator
 *
 * Implements APCA-W3 v0.1.9 for compile-time contrast
 * verification of text-on-background color pairs.
 *
 * @remarks
 * APCA produces a signed Lc (Lightness Contrast) value:
 * - Positive Lc = dark text on light background
 * - Negative Lc = light text on dark background
 * - |Lc| ≥ 75 is the recommended minimum for body text
 * - |Lc| ≥ 60 for large text / non-text UI elements
 *
 * Reference: https://github.com/Myndex/SAPC-APCA
 */

import { oklchToSrgb } from './oklch-math.mjs';

// ── APCA Constants (W3 v0.1.9) ────────────────────────────────────────

const SA98G = {
  mainTRC: 2.4,

  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.0721750,

  normBG: 0.56,
  normTX: 0.57,
  revBG: 0.65,
  revTX: 0.62,

  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  loClip: 0.1,
  deltaYmin: 0.0005,
};

/**
 * Computes APCA luminance (Y) from sRGB [0, 1] values.
 *
 * @param {number} r - sRGB red [0, 1].
 * @param {number} g - sRGB green [0, 1].
 * @param {number} b - sRGB blue [0, 1].
 * @returns {number} APCA luminance Y.
 */
function srgbToY(r, g, b) {
  const rLin = Math.pow(Math.max(0, r), SA98G.mainTRC);
  const gLin = Math.pow(Math.max(0, g), SA98G.mainTRC);
  const bLin = Math.pow(Math.max(0, b), SA98G.mainTRC);

  let Y = SA98G.sRco * rLin + SA98G.sGco * gLin + SA98G.sBco * bLin;

  if (Y < SA98G.blkThrs) {
    Y += Math.pow(SA98G.blkThrs - Y, SA98G.blkClmp);
  }

  return Y < 0 ? 0 : Y;
}

/**
 * Computes APCA Lc (Lightness Contrast) between text and background.
 *
 * @param {[number, number, number]} textRgb - sRGB [0,1] of text.
 * @param {[number, number, number]} bgRgb - sRGB [0,1] of background.
 * @returns {number} Signed Lc value. Positive = dark on light.
 */
export function calcApcaLc(textRgb, bgRgb) {
  const Ytx = srgbToY(...textRgb);
  const Ybg = srgbToY(...bgRgb);

  if (Math.abs(Ybg - Ytx) < SA98G.deltaYmin) return 0;

  let SAPC;

  // Dark text on light background (BoW - Black on White)
  if (Ybg > Ytx) {
    SAPC =
      (Math.pow(Ybg, SA98G.normBG) - Math.pow(Ytx, SA98G.normTX)) *
      SA98G.scaleBoW;
    return SAPC < SA98G.loClip ? 0 : (SAPC - SA98G.loBoWoffset) * 100;
  }

  // Light text on dark background (WoB - White on Black)
  SAPC =
    (Math.pow(Ybg, SA98G.revBG) - Math.pow(Ytx, SA98G.revTX)) *
    SA98G.scaleWoB;
  return SAPC > -SA98G.loClip ? 0 : (SAPC + SA98G.loWoBoffset) * 100;
}

/**
 * Computes APCA Lc between two OKLCH colors.
 * Convenience wrapper that handles OKLCH→sRGB conversion.
 *
 * @param {[number, number, number]} textLCH - OKLCH [L, C, H] of text.
 * @param {[number, number, number]} bgLCH - OKLCH [L, C, H] of background.
 * @returns {number} Absolute |Lc| value.
 */
export function apcaFromOklch(textLCH, bgLCH) {
  const textRgb = oklchToSrgb(...textLCH).map((v) =>
    Math.max(0, Math.min(1, v))
  );
  const bgRgb = oklchToSrgb(...bgLCH).map((v) =>
    Math.max(0, Math.min(1, v))
  );
  return Math.abs(calcApcaLc(textRgb, bgRgb));
}

/**
 * Solves for the exact Lightness (L) required to hit a target APCA contrast.
 * Uses binary search.
 *
 * @param {[number, number, number]} bgLCH - Background OKLCH.
 * @param {number} textH - Desired Hue for the text.
 * @param {number} targetLc - Target absolute Lc (e.g., 75).
 * @param {'light'|'dark'} mode - Determines search direction.
 * @returns {number} The solved Lightness [0, 1].
 */
export function solveApcaLightness(bgLCH, textH, targetLc, mode) {
  // Assume low chroma for text to simplify the binary search
  const textC = 0.05; 
  let lo = mode === 'light' ? 0.0 : 0.5;
  let hi = mode === 'light' ? 0.5 : 1.0;
  let bestL = mode === 'light' ? 0.0 : 1.0;

  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const lc = apcaFromOklch([mid, textC, textH], bgLCH);

    if (mode === 'light') {
      // In light mode, text must be dark. If lc is too low, we need to go darker (lower L)
      if (lc < targetLc) {
        hi = mid;
      } else {
        bestL = mid; // valid, but try to get closer
        lo = mid;
      }
    } else {
      // In dark mode, text must be light. If lc is too low, we need to go lighter (higher L)
      if (lc < targetLc) {
        lo = mid;
      } else {
        bestL = mid;
        hi = mid;
      }
    }
  }

  // Fallback to absolute bounds if we can't hit the target
  return Number(bestL.toFixed(4));
}

/**
 * Verifies critical contrast pairs for a 12-step chromatic scale
 * and returns diagnostics.
 *
 * @param {Array<[number, number, number]>} scale - Array of
 *   OKLCH [L, C, H] for steps 1–12 (12 entries, 0-indexed).
 * @param {string} hueName - Name of the hue for logging.
 * @param {string} mode - 'light' or 'dark'.
 * @returns {{ passed: boolean, results: Array }} Verification result.
 */
export function verifyScaleContrast(scale, hueName, mode) {
  const results = [];

  // Critical pairs: [textStepIdx, bgStepIdx, minLc, description]
  // Using 0-based indices into the 12-step array
  const pairs = [
    // High-contrast text (step 12) on app bg (step 1)
    [11, 0, 75, 'Step 12 text on Step 1 bg'],
    // Low-contrast text (step 11) on app bg (step 1)
    [10, 0, 60, 'Step 11 text on Step 1 bg'],
    // High-contrast text on component bg (step 3)
    [11, 2, 60, 'Step 12 text on Step 3 bg'],
    // App bg text on solid accent (step 9)
    [0, 8, 60, 'Step 1 text on Step 9 solid'],
    // Step 12 text on step 2 bg
    [11, 1, 70, 'Step 12 text on Step 2 bg'],
  ];

  let allPassed = true;

  for (const [tIdx, bIdx, minLc, desc] of pairs) {
    if (tIdx >= scale.length || bIdx >= scale.length) continue;
    const lc = apcaFromOklch(scale[tIdx], scale[bIdx]);
    const passed = lc >= minLc;
    if (!passed) allPassed = false;
    results.push({
      pair: desc,
      lc: +lc.toFixed(1),
      minLc,
      passed,
      hueName,
      mode,
    });
  }

  return { passed: allPassed, results };
}
