/**
 * OKLCH Color Space Mathematics — Enterprise-Grade Precision
 *
 * Implements the complete bidirectional conversion pipeline:
 *   OKLCH ↔ OKLab ↔ Linear RGB ↔ sRGB
 *
 * All transformation matrices sourced from Björn Ottosson's
 * reference implementation (https://bottosson.github.io/posts/oklab/).
 *
 * @remarks
 * - All functions are pure, deterministic, and side-effect free.
 * - sRGB values are normalized to [0, 1] range internally.
 * - OKLCH Hue is in degrees [0, 360).
 * - Epsilon snapping prevents floating-point noise in chroma.
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// ── sRGB Transfer Functions ────────────────────────────────────────────

/**
 * Converts a linear-light sRGB component to gamma-corrected sRGB.
 *
 * @param {number} c - Linear-light value in [0, 1].
 * @returns {number} Gamma-corrected value in [0, 1].
 */
export function linearToSrgb(c) {
  if (c <= 0.0031308) return 12.92 * c;
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Converts a gamma-corrected sRGB component to linear-light.
 *
 * @param {number} c - Gamma-corrected value in [0, 1].
 * @returns {number} Linear-light value in [0, 1].
 */
export function srgbToLinear(c) {
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

// ── OKLab ↔ Linear RGB ────────────────────────────────────────────────

/**
 * Converts OKLab [L, a, b] to linear-light sRGB [r, g, b].
 *
 * @param {number} L - Lightness [0, 1].
 * @param {number} a - Green-red axis.
 * @param {number} b - Blue-yellow axis.
 * @returns {[number, number, number]} Linear RGB in unbounded range.
 */
export function oklabToLinearRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

/**
 * Converts linear-light sRGB [r, g, b] to OKLab [L, a, b].
 *
 * @param {number} r - Linear red [0, 1].
 * @param {number} g - Linear green [0, 1].
 * @param {number} b - Linear blue [0, 1].
 * @returns {[number, number, number]} OKLab [L, a, b].
 */
export function linearRgbToOklab(r, g, b) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

// ── OKLCH ↔ OKLab ─────────────────────────────────────────────────────

/**
 * Converts OKLCH [L, C, H°] to OKLab [L, a, b].
 *
 * @param {number} L - Lightness [0, 1].
 * @param {number} C - Chroma [0, ~0.4].
 * @param {number} H - Hue in degrees [0, 360).
 * @returns {[number, number, number]} OKLab [L, a, b].
 */
export function oklchToOklab(L, C, H) {
  const hRad = H * DEG_TO_RAD;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

/**
 * Converts OKLab [L, a, b] to OKLCH [L, C, H°].
 *
 * @param {number} L - Lightness [0, 1].
 * @param {number} a - Green-red axis.
 * @param {number} b - Blue-yellow axis.
 * @returns {[number, number, number]} OKLCH [L, C, H°].
 */
export function oklabToOklch(L, a, b) {
  const C = Math.sqrt(a * a + b * b);
  let H = C > 1e-8 ? Math.atan2(b, a) * RAD_TO_DEG : 0;
  if (H < 0) H += 360;
  return [L, C, H];
}

// ── OKLCH → sRGB (Full Pipeline) ──────────────────────────────────────

/**
 * Converts OKLCH to gamma-corrected sRGB [0, 1].
 * Values may be outside [0, 1] if out of sRGB gamut.
 *
 * @param {number} L - Lightness.
 * @param {number} C - Chroma.
 * @param {number} H - Hue degrees.
 * @returns {[number, number, number]} sRGB [r, g, b] (possibly unbounded).
 */
export function oklchToSrgb(L, C, H) {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearRgb(labL, labA, labB);
  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

/**
 * Converts gamma-corrected sRGB [0, 1] to OKLCH.
 *
 * @param {number} r - sRGB red [0, 1].
 * @param {number} g - sRGB green [0, 1].
 * @param {number} b - sRGB blue [0, 1].
 * @returns {[number, number, number]} OKLCH [L, C, H°].
 */
export function srgbToOklch(r, g, b) {
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [labL, labA, labB] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(labL, labA, labB);
}

// ── Display P3 Gamut Functions ────────────────────────────────────────

/**
 * Converts linear sRGB [r, g, b] to linear Display P3 [r, g, b].
 * Since both color spaces share the D65 white point, we can use a direct 3x3 matrix.
 */
export function linearSrgbToLinearP3(r, g, b) {
  return [
    0.8224621 * r + 0.177538 * g + 0.0 * b,
    0.0331941 * r + 0.9668058 * g + 0.0 * b,
    0.0170827 * r + 0.0723974 * g + 0.9105199 * b
  ];
}

/**
 * Converts linear Display P3 [r, g, b] to linear sRGB [r, g, b].
 */
export function linearP3ToLinearSrgb(r, g, b) {
  return [
    1.2249401 * r - 0.2249404 * g + 0.0 * b,
   -0.0420569 * r + 1.0420571 * g + 0.0 * b,
   -0.0196376 * r - 0.0786361 * g + 1.0982735 * b
  ];
}

/**
 * Converts OKLCH to linear Display P3 [0, 1].
 * Values may be outside [0, 1] if out of P3 gamut.
 */
export function oklchToLinearP3(L, C, H) {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [lr, lg, lb] = oklabToLinearRgb(labL, labA, labB);
  return linearSrgbToLinearP3(lr, lg, lb);
}

// ── Utility ───────────────────────────────────────────────────────────

/**
 * Snaps sub-epsilon chroma values to 0 to prevent
 * floating-point noise like 0.0000119 in output.
 *
 * @param {number} val - Value to snap.
 * @param {number} threshold - Epsilon threshold.
 * @returns {number} Snapped value.
 */
export function snapEpsilon(val, threshold = 0.0001) {
  return Math.abs(val) < threshold ? 0 : val;
}

/**
 * Computes ΔE(OK) — perceptual color difference in OKLab space.
 * Used for alpha solving convergence and gamut mapping precision.
 *
 * @param {[number, number, number]} lab1 - OKLab [L, a, b].
 * @param {[number, number, number]} lab2 - OKLab [L, a, b].
 * @returns {number} Perceptual distance.
 */
export function deltaEOK(lab1, lab2) {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Formats OKLCH channels to space-separated SASS-compatible string.
 *
 * @param {number} L - Lightness.
 * @param {number} C - Chroma.
 * @param {number} H - Hue degrees.
 * @returns {string} Formatted string, e.g. "0.961 0.0017 247.8".
 */
export function fmtOklch(L, C, H) {
  const snappedC = snapEpsilon(C);
  return `${+L.toFixed(4)} ${+snappedC.toFixed(4)} ${+H.toFixed(1)}`;
}
