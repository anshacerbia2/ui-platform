#!/usr/bin/env node
// Palette generator (TDD tokens, "Palette generation" PG1-PG11): the only
// producer of the Tier-1 color scales. Reads palette.config.json and the
// contrast minimums of tokens.config.json, and writes
// src/styles/abstracts/_core-palette.generated.scss.
//
//   node scripts/palette/generate.mjs            write the generated file
//   node scripts/palette/generate.mjs --check    fail when the file differs from a fresh generation
//   node scripts/palette/generate.mjs --report <file>   also write the constraint report as JSON

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generate, stepName } from "./solve.mjs";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const OUTPUT = path.join(
  packageDir,
  "src/styles/abstracts/_core-palette.generated.scss",
);
const CONFIG = path.join(packageDir, "scripts/palette/palette.config.json");

// White and black are photometric constants, not generated scales: a gray
// ramp and an alpha ramp of pure white or black, identical in both modes.
const ALPHA_RAMP = [
  0.05, 0.07, 0.12, 0.18, 0.25, 0.33, 0.41, 0.51, 0.61, 0.72, 0.83, 0.95,
];
const CONSTANTS = {
  white: {
    steps: [
      0.05, 0.076, 0.124, 0.185, 0.258, 0.341, 0.433, 0.532, 0.639, 0.753,
      0.873, 1,
    ],
    ink: "1 0 0",
  },
  black: {
    steps: [
      0.95, 0.924, 0.876, 0.815, 0.742, 0.659, 0.567, 0.468, 0.361, 0.247,
      0.127, 0,
    ],
    ink: "0 0 0",
  },
};

const num = (value) => String(Number(value));
const channels = (color) =>
  `${num(color.coords[0])} ${num(color.coords[1])} ${num(color.coords[2])}`;

function constantBlock(name) {
  const { steps, ink } = CONSTANTS[name];
  const mode = [
    ...steps.map((l, i) => `      ${i + 1}: ${num(l)} 0 0,`),
    ...ALPHA_RAMP.map((a, i) => `      "${i + 1}A": ${ink} / ${num(a)},`),
  ].join("\n");
  return `  ${name}: (\n    light: (\n${mode}\n    ),\n    dark: (\n${mode}\n    ),\n  ),`;
}

function scaleBlock(name, scales, alphas) {
  const mode = (m) =>
    [
      ...scales[m].map((color, i) => [
        i === 12 ? 9.5 : i,
        `      ${i === 12 ? `"${stepName(i)}"` : stepName(i)}: ${channels(color)},`,
      ]),
      ...alphas[m].map(({ color, alpha }, i) => [
        100 + i,
        `      "${i + 1}A": ${channels(color)} / ${num(alpha)},`,
      ]),
    ]
      .sort((a, b) => a[0] - b[0])
      .map(([, line]) => line)
      .join("\n");
  return `  ${name}: (\n    light: (\n${mode("light")}\n    ),\n    dark: (\n${mode("dark")}\n    ),\n  ),`;
}

/** The generated Sass module for a configuration. */
export function render(config, contrast) {
  const { scales, alphas, labels, report } = generate(config, contrast);
  const names = Object.keys(scales);
  const text = [
    "// GENERATED FILE. Do not edit: change scripts/palette/palette.config.json and run",
    "// `pnpm --filter @scnx/system palette`. CI regenerates it and fails on any",
    "// difference (TDD tokens, Palette generation PG8).",
    "//",
    `// Shape: the Radix Colors custom-palette algorithm on the ${config.reference.package} ${config.reference.version}`,
    "// Display P3 scales (MIT License, Copyright (c) 2022 WorkOS). Constraints: WCAG 2.2",
    "// SC 1.4.3 and 1.4.11 on the token gate's four display paths, Display P3 gamut.",
    "",
    "/// Tier-1 color scales (STD-UIP-TKN-001 `color.{hue}.{axis}.{step}`): steps 1-12",
    "/// by Radix use, 10B the pressed solid fill, and 1A-12A each step as an alpha",
    "/// color over neutral step 1 of the mode. Keys stay unquoted because the lookups",
    "/// compare `meta.inspect` of the key.",
    "$color: (",
    constantBlock("white"),
    constantBlock("black"),
    ...names.map((name) => scaleBlock(name, scales[name], alphas[name])),
    ");",
    "",
    "/// Polarity of the label on each scale's solid fill: `light` is white and",
    "/// `dark` neutral step 12 of the light axis, in both modes (PG3); `contrast`",
    "/// is neutral step 1 of the mode, on the scale's own step-12 fill (PG11).",
    `$solid-label: (${names.map((name) => `${name}: ${labels[name]}`).join(", ")});`,
    "",
  ].join("\n");
  return { text, report };
}

function loadContrast() {
  const tokens = JSON.parse(
    fs.readFileSync(path.join(packageDir, "tokens.config.json"), "utf8"),
  );
  return tokens.contrast;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
  const { text, report } = render(config, loadContrast());
  const reportAt = args.indexOf("--report");
  if (reportAt > -1) {
    fs.mkdirSync(path.dirname(path.resolve(args[reportAt + 1])), {
      recursive: true,
    });
    fs.writeFileSync(
      path.resolve(args[reportAt + 1]),
      `${JSON.stringify(report, null, 2)}\n`,
    );
  }
  const relative = path.relative(packageDir, OUTPUT);
  if (args.includes("--check")) {
    const current = fs.existsSync(OUTPUT)
      ? fs.readFileSync(OUTPUT, "utf8")
      : "";
    if (current !== text) {
      const a = current.split("\n");
      const b = text.split("\n");
      const line = a.findIndex((value, i) => value !== b[i]);
      console.error(
        `${relative} differs from a fresh generation (first difference at line ${line + 1}).`,
      );
      console.error(
        `  file:      ${a[line] ?? "<end>"}\n  generated: ${b[line] ?? "<end>"}`,
      );
      console.error(
        "Edit scripts/palette/palette.config.json and run `pnpm --filter @scnx/system palette`; never edit the generated file.",
      );
      process.exit(1);
    }
    console.log(`${relative} matches a fresh generation.`);
  } else {
    fs.writeFileSync(OUTPUT, text);
    console.log(`wrote ${relative}`);
  }
  const boundary = Object.values(report.boundary).map((v) => v.toFixed(2));
  console.log(
    `  ${Object.keys(report.hues).length} scales x 2 modes; control boundary ${boundary.join(" / ")}:1; every constraint holds`,
  );
}
