/**
 * ΔE(OK)-Based Alpha Channel Solver
 *
 * Given a target opaque OKLCH color and a background OKLCH color,
 * finds the optimal foreground color + alpha that composites to
 * the target when blended over the background.
 *
 * Uses binary search with ΔE(OK) perceptual error metric
 * for convergence — far more precise than brute-force iteration.
 *
 * @remarks
 * Alpha compositing formula (premultiplied):
 *   result = fg * alpha + bg * (1 - alpha)
 *
 * We solve for the lowest alpha where the foreground channels
 * remain within sRGB gamut [0, 1].
 */

import {
  oklchToOklab,
  oklabToLinearRgb,
  linearRgbToOklab,
  oklabToOklch,
  deltaEOK,
  snapEpsilon,
  oklchToSrgb,
  srgbToOklch,
} from './oklch-math.mjs';

/**
 * Solves for the minimum alpha and corresponding foreground
 * OKLCH that composites to the target color over the background.
 *
 * Uses non-linear sRGB blending to match the browser's native compositing pipeline,
 * and clamps inputs to the [0, 1] sRGB range to prevent P3 gamut overshoot from
 * causing mathematical inversions (such as inflated step 2 alphas).
 *
 * @param {[number, number, number]} targetLCH - Target OKLCH.
 * @param {[number, number, number]} bgLCH - Background OKLCH.
 * @param {number} maxDeltaE - Maximum acceptable ΔE(OK) error.
 * @returns {{ oklch: [number, number, number], alpha: string }}
 */
export function solveAlpha(targetLCH, bgLCH, maxDeltaE = 0.005) {
  // Clamp target and background to valid sRGB space [0, 1] to prevent P3 gamut mapping offsets
  // from forcing artificial alpha inflation in sRGB gamut search.
  const [tR, tG, tB] = oklchToSrgb(...targetLCH).map(c => Math.max(0, Math.min(1, c)));
  const [bR, bG, bB] = oklchToSrgb(...bgLCH).map(c => Math.max(0, Math.min(1, c)));

  // Binary search for minimum valid alpha
  let lo = 0.01;
  let hi = 1.0;
  let bestAlpha = 1.0;
  let bestOklch = targetLCH;

  for (let iter = 0; iter < 32; iter++) {
    const alpha = (lo + hi) / 2;

    // Solve foreground sRGB channels using non-linear alpha compositing:
    // target = fg * alpha + bg * (1 - alpha)
    const fR = (tR - bR * (1 - alpha)) / alpha;
    const fG = (tG - bG * (1 - alpha)) / alpha;
    const fB = (tB - bB * (1 - alpha)) / alpha;

    // Check if foreground is within gamut limits with a relaxed tolerance of 0.002
    const inGamut =
      fR >= -0.002 && fR <= 1.002 &&
      fG >= -0.002 && fG <= 1.002 &&
      fB >= -0.002 && fB <= 1.002;

    if (inGamut) {
      // Clamp to valid sRGB range for reconstruction and output
      const cr = Math.max(0, Math.min(1, fR));
      const cg = Math.max(0, Math.min(1, fG));
      const cb = Math.max(0, Math.min(1, fB));

      const fgLch = srgbToOklch(cr, cg, cb);

      // Verify reconstruction accuracy in browser-equivalent non-linear sRGB blending space
      const reconR = cr * alpha + bR * (1 - alpha);
      const reconG = cg * alpha + bG * (1 - alpha);
      const reconB = cb * alpha + bB * (1 - alpha);

      const reconLch = srgbToOklch(reconR, reconG, reconB);
      
      const targetLab = oklchToOklab(...targetLCH);
      const reconLab = oklchToOklab(...reconLch);
      const error = deltaEOK(targetLab, reconLab);

      if (error <= maxDeltaE) {
        bestAlpha = alpha;
        bestOklch = fgLch;
        hi = alpha; // Try lower alpha
      } else {
        lo = alpha; // Need more opacity
      }
    } else {
      lo = alpha; // Need more opacity for gamut safety
    }
  }

  // Snap to nearest 0.01 for clean output
  const roundedAlpha = Math.round(bestAlpha * 100) / 100;

  return {
    oklch: [
      bestOklch[0],
      snapEpsilon(bestOklch[1]),
      bestOklch[2],
    ],
    alpha: roundedAlpha.toFixed(2),
  };
}
