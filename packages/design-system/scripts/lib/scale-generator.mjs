/**
 * OKLCH Scale Generator — Gamut-Adaptive, 12-Step Architecture
 *
 * Generates 12-step color scales using three techniques:
 *
 * 1. **Uniform Lightness Targets** — 12-step, shared across all hues
 * 2. **Gamut-Relative Chroma** — each step's chroma is a % of the
 *    maximum sRGB-representable chroma at that lightness/hue
 * 3. **sRGB Gamut Mapping** — CSS Color L4 binary search fallback
 *
 * @remarks
 * The lightness targets are the foundational invariant.
 * They guarantee that step N of any hue has the same
 * perceived brightness, enabling predictable contrast
 * ratios and harmonious multi-hue compositions.
 *
 * The gamut-relative chroma approach replaces the previous
 * Gaussian bell curve, which suffered from massive gamut
 * over-clamping (the curve asked for chroma beyond sRGB
 * capacity, destroying the intentional saturation shape).
 *
 * Step mapping to UI roles (Radix 12-step aligned):
 *   1-2:   App backgrounds (barely tinted)
 *   3-4:   Component backgrounds (default, hover)
 *   5-6:   Active states, subtle borders
 *   7-8:   Borders, UI chrome
 *   9:     Solid/accent (primary buttons, badges)
 *   10:    Solid hover/pressed
 *   11:    Low-contrast text, icons
 *   12:    High-contrast text
 */

import { gamutMapToSrgb, maxChromaInSrgb, gamutMapToP3, maxChromaInP3 } from './gamut.mjs';
import { solveApcaLightness } from './contrast.mjs';

// ── Lightness Targets ─────────────────────────────────────────────────

/**
 * Neutral scale has 12 steps (0, 100–1000, 1100) for
 * extra granularity at the extreme ends.
 */
export const NEUTRAL_L = {
  //       0      100    200    300    400    500    600    700    800    900    1000   1100
  light: [1.000, 0.985, 0.960, 0.930, 0.880, 0.790, 0.740, 0.640, 0.610, 0.470, 0.240, 0.155],
  dark:  [0.070, 0.130, 0.185, 0.240, 0.310, 0.410, 0.500, 0.600, 0.720, 0.840, 0.920, 0.985],
};

// ── Gaussian Chroma Curve (for Neutrals only) ─────────────────────────

export function gaussianChroma(stepIndex, peakC, center = 5.5, sigma = 4.0) {
  const x = stepIndex - center;
  return peakC * Math.exp(-(x * x) / (2 * sigma * sigma));
}

// ── Gamut-Relative Chroma ─────────────────────────────────────────────

export function gamutRelativeChroma(L, H, ratio, gamut = 'srgb') {
  const maxC = gamut === 'p3' ? maxChromaInP3(L, H) : maxChromaInSrgb(L, H);
  return maxC * ratio;
}

// ── Scale Generation ──────────────────────────────────────────────────

/**
 * Generates a complete chromatic scale (12 steps).
 * Steps 1-10 are computed via profiles, Steps 11-12 are APCA solved.
 *
 * @param {object} profile - Hue profile from profiles.mjs.
 * @param {'light' | 'dark'} mode - Target mode.
 * @param {'srgb' | 'p3'} gamut - Target gamut (default: srgb).
 * @returns {Array<[number, number, number]>} Array of OKLCH triplets (12 entries).
 */
export function generateChromaticScale(profile, mode, gamut = 'srgb') {
  const lightness = mode === 'light' ? profile.lightnessLight : profile.lightnessDark;
  const hueDrift = mode === 'light'
    ? (profile.hueDriftLight ?? 0)
    : (profile.hueDriftDark ?? 0);

  const scale = lightness.map((L, i) => {
    // Hue with optional per-step micro-drift
    const driftFraction = i / 11; // 12 steps total, max index 11
    const H = profile.H + hueDrift * driftFraction;

    // Chroma from gamut-relative curve
    const ratio = profile.chromaCurve[i];
    const C = gamutRelativeChroma(L, H, ratio, gamut);

    return gamut === 'p3' ? gamutMapToP3(L, C, H) : gamutMapToSrgb(L, C, H);
  });

  // Dynamically generate Step 11 and Step 12 using APCA
  // Step 1: App background (index 0)
  // Step 3: Component background (index 2)
  const bgApp = scale[0];
  const bgComp = scale[2];
  
  // Drift hue for text steps
  const H11 = profile.H + hueDrift * (10 / 11);
  const H12 = profile.H + hueDrift * (11 / 11);

  // Step 11: Low-contrast text (Target Lc 65 against app bg)
  const L11 = solveApcaLightness(bgApp, H11, 65, mode);
  const C11 = gamutRelativeChroma(L11, H11, profile.chromaCurve[10], gamut);
  scale.push(gamut === 'p3' ? gamutMapToP3(L11, C11, H11) : gamutMapToSrgb(L11, C11, H11));

  // Step 12: High-contrast text (Target Lc 90 against app bg)
  const L12 = solveApcaLightness(bgApp, H12, 90, mode);
  const C12 = gamutRelativeChroma(L12, H12, profile.chromaCurve[11], gamut);
  scale.push(gamut === 'p3' ? gamutMapToP3(L12, C12, H12) : gamutMapToSrgb(L12, C12, H12));

  return scale;
}

/**
 * Generates a complete neutral scale (12 steps).
 *
 * @param {object} profile - Neutral hue profile.
 * @param {'light' | 'dark'} mode - Target mode.
 * @param {'srgb' | 'p3'} gamut - Target gamut (default: srgb).
 * @returns {Array<[number, number, number]>} Array of OKLCH triplets.
 */
export function generateNeutralScale(profile, mode, gamut = 'srgb') {
  const lightness = NEUTRAL_L[mode];

  return lightness.map((L, i) => {
    // Neutrals have very low chroma with a subtle Gaussian
    const rawC = gaussianChroma(
      i,
      profile.peakC ?? 0.014,
      profile.peakCenter ?? 5.5,
      profile.sigma ?? 4.0
    );

    return gamut === 'p3' ? gamutMapToP3(L, rawC, profile.H) : gamutMapToSrgb(L, rawC, profile.H);
  });
}
