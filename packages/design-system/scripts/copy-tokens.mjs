import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '..');

const distStylesDir = path.join(packageDir, 'dist', 'styles');
const abstractsDir = path.join(packageDir, 'src', 'styles', 'abstracts');

const filesToCopy = [
  '_core-token.scss',
  '_contract-token.scss',
  '_variables.scss',
];

if (!fs.existsSync(distStylesDir)) {
  fs.mkdirSync(distStylesDir, { recursive: true });
}

for (const file of filesToCopy) {
  const src = path.join(abstractsDir, file);
  const dest = path.join(distStylesDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to dist/styles`);
  } else {
    console.error(`✗ Failed to find ${file} in src/styles/abstracts`);
    process.exit(1);
  }
}
