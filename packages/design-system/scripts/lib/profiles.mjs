/**
 * OKLCH Hue Profiles — Premium Gamut-Adaptive Architecture
 *
 * Each profile defines:
 * - H: Baseline hue angle in OKLCH degrees [0, 360).
 * - lightnessLight / lightnessDark: Per-step Lightness targets [0.0–1.0].
 *   Generated using a strict monotonic easing function to guarantee buttery
 *   smooth gradients without any "hiccups" or bumps. Step 9 is specifically
 *   anchored at the hue's natural luminance peak.
 * - chromaCurve: Per-step utilization ratio [0.0–1.0] of the maximum
 *   sRGB-representable chroma.
 */

/**
 * Generates a strictly monotonic array of 10 Lightness values.
 * Anchors the curve at Step 9 (index 8), and calculates Step 10 (index 9)
 * as a very subtle delta to ensure smooth hover states.
 */
function genL(l1, l9, mode) {
  const result = new Array(10);
  result[0] = l1;
  result[8] = l9;
  
  // Subtle delta for Step 10 (Default Solid State)
  // Ensures hover (Step 9) is lighter, but default is not overly dark.
  // In dark mode, human perception requires a slightly larger delta 
  // for the "glow" to be clearly visible at mid-tones.
  const deltaLight = 0.025;
  const deltaDark = 0.045;
  
  result[9] = mode === 'light' ? l9 - deltaLight : l9 + deltaDark;
  
  // Interpolate Steps 2 to 8 (indices 1 to 7)
  for (let i = 1; i < 8; i++) {
    const t = i / 8; 
    // ease-in for light mode, ease-out for dark
    const ease = mode === 'light' ? Math.pow(t, 1.4) : Math.pow(t, 1.2);
    result[i] = l1 + (l9 - l1) * ease;
  }
  
  return result.map(v => Number(v.toFixed(3)));
}

export const PROFILES = {
  red: {
    H: 25,
    lightnessLight: genL(0.99, 0.62, 'light'),
    lightnessDark:  genL(0.12, 0.50, 'dark'),
    chromaCurve: [0.06, 0.14, 0.24, 0.38, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: -3,
    hueDriftDark: -5,
  },
  orange: {
    H: 50,
    lightnessLight: genL(0.99, 0.70, 'light'),
    lightnessDark:  genL(0.12, 0.58, 'dark'),
    chromaCurve: [0.08, 0.16, 0.28, 0.42, 0.58, 0.75, 0.85, 0.95, 0.98, 0.95, 0.65, 0.45],
    hueDriftLight: -5,
    hueDriftDark: 3,
  },
  yellow: {
    H: 95,
    lightnessLight: genL(0.99, 0.85, 'light'),
    lightnessDark:  genL(0.10, 0.73, 'dark'),
    chromaCurve: [0.10, 0.20, 0.35, 0.50, 0.65, 0.80, 0.90, 0.95, 0.98, 0.90, 0.65, 0.50],
    hueDriftLight: 0,
    hueDriftDark: 3,
  },
  lime: {
    H: 130,
    lightnessLight: genL(0.99, 0.79, 'light'),
    lightnessDark:  genL(0.10, 0.67, 'dark'),
    chromaCurve: [0.08, 0.16, 0.28, 0.42, 0.58, 0.75, 0.85, 0.95, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: -3,
    hueDriftDark: -2,
  },
  green: {
    H: 152,
    lightnessLight: genL(0.99, 0.64, 'light'),
    lightnessDark:  genL(0.11, 0.52, 'dark'),
    chromaCurve: [0.06, 0.14, 0.26, 0.40, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: 0,
    hueDriftDark: -5,
  },
  teal: {
    H: 192,
    lightnessLight: genL(0.99, 0.66, 'light'),
    lightnessDark:  genL(0.11, 0.54, 'dark'),
    chromaCurve: [0.06, 0.14, 0.26, 0.40, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: 0,
    hueDriftDark: 3,
  },
  blue: {
    H: 260,
    lightnessLight: genL(0.99, 0.59, 'light'),
    lightnessDark:  genL(0.12, 0.47, 'dark'),
    chromaCurve: [0.06, 0.14, 0.26, 0.40, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: -4,
    hueDriftDark: 5,
  },
  purple: {
    H: 296,
    lightnessLight: genL(0.99, 0.58, 'light'),
    lightnessDark:  genL(0.12, 0.45, 'dark'),
    chromaCurve: [0.06, 0.14, 0.26, 0.40, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: 0,
    hueDriftDark: -3,
  },
  magenta: {
    H: 345,
    lightnessLight: genL(0.99, 0.61, 'light'),
    lightnessDark:  genL(0.12, 0.49, 'dark'),
    chromaCurve: [0.06, 0.14, 0.26, 0.40, 0.55, 0.70, 0.82, 0.92, 0.98, 0.92, 0.65, 0.45],
    hueDriftLight: 0,
    hueDriftDark: 3,
  },
};

export const NEUTRAL_PROFILE = {
  H: 252,       // Deep Navy tint for premium dark surfaces
  peakC: 0.012, 
  peakCenter: 5.5,
  sigma: 4.5,   
};
