/**
 * SASS Map Emitter & Injector
 *
 * Formats generated OKLCH palettes into SASS maps and
 * injects them directly into _core-token.scss.
 *
 * @remarks
 * All scales (neutral + chromatic) use unified 12-step naming (1-12).
 * Alpha variants are suffixed with 'A' (e.g., '1A', '2A').
 * This ensures `resolve-core-color(hue, step, mode)` works
 * identically for all hue families.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fmtOklch } from './oklch-math.mjs';
import { solveAlpha } from './alpha-solver.mjs';

/**
 * Builds the complete $color SASS map string.
 *
 * @param {object} palettes - Generated palettes data.
 * @returns {string} SASS map string.
 */
export function buildSassMap(palettes) {
  const steps12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  let out = '$color: (\n';

  // --- PHOTOMETRIC ABSOLUTE ENGINE (Black & White) ---
  for (const color of ['white', 'black']) {
    const isWhite = color === 'white';
    const lch = isWhite ? [1, 0, 0] : [0, 0, 0];
    const bgLch = isWhite ? [0, 0, 0] : [1, 0, 0];
    
    out += `  ${color}: (\n`;
    for (const mode of ['light', 'dark']) {
      out += `    ${mode}: (\n`;
      out += '      // Solid Photometric Reconstruction\n';
      steps12.forEach((step, i) => {
        const t = i / 11;
        const ease = Math.pow(t, 1.5);
        const alpha = 0.05 + ease * (1.0 - 0.05);
        
        const lMix = lch[0] * alpha + bgLch[0] * (1 - alpha);
        const roundedMix = Math.round(lMix * 1000) / 1000;
        out += `      ${step}: ${roundedMix} 0 0,\n`;
      });
      
      out += '\n      // Perceptual Alpha Ramp\n';
      steps12.forEach((step, i) => {
        const t = i / 11;
        const ease = Math.pow(t, 1.5);
        const alpha = 0.05 + ease * (0.95 - 0.05); // Capped at 0.95 overlay
        const roundedAlpha = Math.round(alpha * 100) / 100;
        out += `      "${step}A": ${lch[0]} 0 0 / ${roundedAlpha},\n`;
      });
      out += '    ),\n';
    }
    out += '  ),\n\n';
  }

  // 1. NEUTRALS (12-step unified: 1-12 + alphas)
  // Neutral scale has 12 entries: index 0-11 in the array.
  // We map them to steps 1-12 for consistency with chromatic hues.
  out += '  neutral: (\n';
  for (const mode of ['light', 'dark']) {
    const scale = palettes.neutral[mode]; // 12 entries, index 0-11
    const bgLCH = scale[0]; // step 1 is app background

    out += `    ${mode}: (\n`;
    out += '      // Solid Palette (1 to 12)\n';
    steps12.forEach((step, i) => {
      out += `      ${step}: ${fmtOklch(...scale[i])},\n`;
    });
    out += '\n      // Alpha Palette (1A to 12A)\n';
    steps12.forEach((step, i) => {
      const target = scale[i];
      const { oklch, alpha } = solveAlpha(target, bgLCH);
      out += `      "${step}A": ${fmtOklch(...oklch)} / ${alpha},\n`;
    });
    out += '    ),\n';
  }
  out += '  ),\n\n';

  // 2. CHROMATICS (12-step: 1-12 + alphas)
  for (const [name, modeScales] of Object.entries(palettes.chromatics)) {
    out += `  ${name}: (\n`;
    for (const mode of ['light', 'dark']) {
      const scale = modeScales[mode];
      // Blend against neutral step-1 bg for consistency
      const bgLCH = palettes.neutral[mode][0];

      out += `    ${mode}: (\n`;
      out += '      // Solid Palette (1 to 12)\n';
      steps12.forEach((step, i) => {
        out += `      ${step}: ${fmtOklch(...scale[i])},\n`;
      });
      out += '\n      // Alpha Palette (1A to 12A)\n';
      steps12.forEach((step, i) => {
        const target = scale[i];
        const { oklch, alpha } = solveAlpha(target, bgLCH);
        out += `      "${step}A": ${fmtOklch(...oklch)} / ${alpha},\n`;
      });
      out += '    ),\n';
    }
    out += '  ),\n';
  }

  out += ');';
  return out;
}

/**
 * Injects the generated SASS map into the core token file.
 *
 * @param {string} scssFilePath - Path to _core-token.scss
 * @param {string} newMapStr - Generated SASS map string
 * @returns {boolean} True if successful
 */
export function injectIntoScss(scssFilePath, newMapStr) {
  if (!fs.existsSync(scssFilePath)) {
    console.error(`\n❌ Core tokens file not found at: ${scssFilePath}`);
    return false;
  }

  const fileContent = fs.readFileSync(scssFilePath, 'utf8');

  // Find boundaries of existing $color map
  const mapStartTag = '$color: (';
  const mapStartIdx = fileContent.indexOf(mapStartTag);
  if (mapStartIdx === -1) {
    console.error('❌ Could not find "$color: (" declaration in _core-token.scss');
    return false;
  }

  const spacingHeader = '// ==========================================\n// 2. SPACING & SIZING';
  const spacingHeaderAlt = '// ==========================================\r\n// 2. SPACING & SIZING';
  
  let mapEndIdx = fileContent.indexOf(spacingHeader);
  if (mapEndIdx === -1) {
    mapEndIdx = fileContent.indexOf(spacingHeaderAlt);
  }

  if (mapEndIdx === -1) {
    console.error('❌ Could not locate the Spacing section boundary to terminate injection');
    return false;
  }

  // Stitch file back together
  const header = fileContent.substring(0, mapStartIdx);
  const footer = fileContent.substring(mapEndIdx);
  const newFileContent = header + newMapStr + '\n\n' + footer;

  fs.writeFileSync(scssFilePath, newFileContent, 'utf8');
  return true;
}
