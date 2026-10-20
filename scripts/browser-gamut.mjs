#!/usr/bin/env node
// Display-path evidence (TDD tokens G2; STD-UIP-TKN-001 2.3.0). Paints every
// distinct packed token color outside sRGB into an sRGB 2D canvas in every
// engine of support-matrix.json, reads the pixel back, and records whether the
// engine clipped it or gamut mapped it with the CSS Color 4 algorithm. CSS
// Color 4 specifies mapping for a unorm8 canvas; the contrast gate tests both,
// and this report shows which one each engine does. Nothing here is a gate on
// the behavior: the step fails only when a measurement is missing.
//
//   node scripts/browser-gamut.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import fs from "node:fs";
import path from "node:path";
import { browserEngines } from "./browser-engines.mjs";
import { DISPLAY_PATHS, inSrgbGamut, onDisplay, parseColor } from "../packages/design-system/scripts/tokens/color.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");
const root = path.join(packsDir, system.tarball.replace(/\.tgz$/, ""), "package");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

// Every distinct oklch() value of the packed token stylesheets that lies outside sRGB.
const values = new Set();
for (const [subpath, target] of Object.entries(manifest.exports)) {
  if (!/^\.\/tokens\/css\/[a-z0-9-]+\.css$/.test(subpath)) continue;
  for (const [value] of fs.readFileSync(path.join(root, target), "utf8").matchAll(/oklch\([^)]*\)/g)) {
    const color = parseColor(value);
    if (color && !inSrgbGamut(color)) values.add(value);
  }
}
const samples = [...values].sort();

const byte = (color) => color.coords.map((channel) => Math.round(Math.min(1, Math.max(0, channel ?? 0)) * 255));
const [clipPath, mapPath] = ["srgb-clip", "srgb-map"].map((name) => DISPLAY_PATHS.find((p) => p.name === name));
const expected = samples.map((value) => {
  const color = parseColor(value);
  return { value, clip: byte(onDisplay(color, clipPath)), map: byte(onDisplay(color, mapPath)) };
});
const distance = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));

const report = { schemaVersion: 1, purpose: "Evidence for TDD tokens G2; not a gate on engine behavior", canvas: "2d, colorSpace srgb, unorm8", values: samples.length, engines: [] };
let failed = false;
try {
  if (samples.length === 0) throw new Error("no packed token color lies outside sRGB; nothing to measure");
  for (const engine of browserEngines()) {
    const browser = await engine.type.launch();
    try {
      const page = await browser.newPage();
      const pixels = await page.evaluate((list) => list.map((value) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d", { colorSpace: "srgb" });
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      }), samples);
      const counts = { clip: 0, map: 0, same: 0 };
      let maxLightness = 0;
      const differing = [];
      expected.forEach((e, i) => {
        const [toClip, toMap] = [distance(pixels[i], e.clip), distance(pixels[i], e.map)];
        const closer = toClip < toMap ? "clip" : toMap < toClip ? "map" : "same";
        counts[closer]++;
        const shown = parseColor(`rgb(${pixels[i].join(" ")})`).to("oklch").coords[0];
        const mapped = parseColor(`rgb(${e.map.join(" ")})`).to("oklch").coords[0];
        maxLightness = Math.max(maxLightness, Math.abs(shown - mapped));
        if (closer !== "same") differing.push({ value: e.value, painted: pixels[i], clip: e.clip, map: e.map, closer });
      });
      report.engines.push({ engine: engine.name, version: browser.version(), ...counts, maxLightnessDifferenceFromMapped: Number(maxLightness.toFixed(4)), differing });
      console.log(`${engine.name} ${browser.version()}: of ${samples.length} values, ${counts.clip} closer to clipped, ${counts.map} closer to mapped, ${counts.same} identical; max OKLCH lightness difference from mapped ${maxLightness.toFixed(4)}`);
    } finally {
      await browser.close();
    }
  }
  report.result = "pass";
} catch (error) {
  failed = true;
  report.result = "fail";
  report.error = error.message;
  console.error(`Display-path evidence: FAILED\n${error.message}`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "gamut-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failed) process.exit(1);
