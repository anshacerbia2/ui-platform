/**
 * OKLCH-Native Token Generator
 *
 * FAANG-tier palette generator operating entirely in OKLCH space.
 * Features:
 * - Uniform perceptual lightness targets across all hues
 * - Gaussian chroma curves for balanced saturation
 * - CSS Color Level 4 sRGB gamut mapping via binary search
 * - APCA Lc accessibility verification at compile time
 * - ΔE(OK)-based alpha channel solving
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROFILES, NEUTRAL_PROFILE } from './lib/profiles.mjs';
import { generateChromaticScale, generateNeutralScale } from './lib/scale-generator.mjs';
import { verifyScaleContrast } from './lib/contrast.mjs';
import { buildSassMap, injectIntoScss } from './lib/sass-emitter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('\n🚀 Starting OKLCH-Native Palette Generation...\n');

  const palettes = {
    neutral: { light: [], dark: [] },
    chromatics: {},
  };

  let totalWarnings = 0;

  // 1. Generate Neutral Scales
  for (const mode of ['light', 'dark']) {
    palettes.neutral[mode] = generateNeutralScale(NEUTRAL_PROFILE, mode, 'p3');
  }

  // 2. Generate Chromatic Scales & Verify Contrast
  for (const [hueName, profile] of Object.entries(PROFILES)) {
    palettes.chromatics[hueName] = { light: [], dark: [] };
    
    for (const mode of ['light', 'dark']) {
      const scale = generateChromaticScale(profile, mode, 'p3');
      palettes.chromatics[hueName][mode] = scale;

      // APCA Verification
      const { passed, results } = verifyScaleContrast(scale, hueName, mode);
      
      if (!passed) {
        console.warn(`\n⚠️  Contrast warnings for ${hueName}-${mode}:`);
        results.filter(r => !r.passed).forEach(r => {
          console.warn(`    - ${r.pair}: Lc = ${r.lc} (Expected ≥ ${r.minLc})`);
        });
        totalWarnings++;
      }
    }
  }

  if (totalWarnings === 0) {
    console.log('✅ All APCA critical contrast pairs passed.');
  } else {
    console.warn(`\n⚠️  Found ${totalWarnings} contrast warnings. Colors were still generated, but review is recommended.`);
  }

  // 3. Emit SASS and Inject
  console.log('\n⏳ Solving alpha channels and compiling SASS map...');
  const sassStr = buildSassMap(palettes);
  
  const scssFilePath = path.resolve(__dirname, '../src/styles/abstracts/_core-token.scss');
  const success = injectIntoScss(scssFilePath, sassStr);

  if (success) {
    console.log(`\n🎉 Successfully injected OKLCH tokens into:`);
    console.log(`   ${scssFilePath}`);
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error during generation:');
  console.error(err);
  process.exit(1);
});
