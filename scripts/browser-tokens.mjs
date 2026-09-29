#!/usr/bin/env node
// Browser verifier (TDD tokens, "CSS and visual validation"; Testing Strategy
// "Packed browser"). Loads the packed @scnx/system token stylesheets over HTTP
// in Chromium with every theme/mode root on one page, and fails unless:
// - every root declares every JSON token, with the emitted value;
// - every resolved value is valid for a consuming property in the engine;
// - roots of different themes coexist (a theme-specific token differs);
// - each declared font face loads from the package.
//
//   node scripts/browser-tokens.mjs --packs <dir from inspect-packages.mjs>

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const report = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = report.packages.find((pkg) => pkg.name === "@scnx/system");
const root = path.join(packsDir, system.tarball.replace(/\.tgz$/, ""), "package");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const themes = Object.keys(manifest.exports)
  .map((subpath) => /^\.\/tokens\/json\/([a-z0-9-]+)\.json$/.exec(subpath)?.[1])
  .filter(Boolean);
if (themes.length === 0) throw new Error("the packed @scnx/system exports no token JSON");
const target = (subpath) => manifest.exports[subpath].replace(/^\.\//, "");

// Representative consuming property per token type (TDD tokens: color,
// background, border, box-shadow, typography, spacing, motion, z-index).
const PROPERTY = {
  color: "color",
  shadow: "box-shadow",
  duration: "transition-duration",
  cubicBezier: "transition-timing-function",
  fontFamily: "font-family",
  fontWeight: "font-weight",
  dimension: "width",
  number: "opacity",
  strokeStyle: "border-style",
};
const propertyFor = (token) =>
  /-z-index-|^--ds-z-/.test(token.cssName) ? "z-index"
    : /-line-height-/.test(token.cssName) ? "line-height"
    : /-letter-spacing-/.test(token.cssName) ? "letter-spacing"
    : PROPERTY[token.type] ?? null;

const cases = themes.map((theme) => {
  const json = JSON.parse(fs.readFileSync(path.join(root, target(`./tokens/json/${theme}.json`)), "utf8"));
  return {
    theme,
    css: `/${target(`./tokens/css/${theme}.css`)}`,
    modes: json.modes,
    tokens: json.tokens.map((t) => ({ cssName: t.cssName, property: propertyFor(t), values: t.themes[theme], resolved: t.resolved[theme] })),
  };
});

const TYPES = { ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".html": "text/html" };
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (url === "/") {
    const links = cases.map((c) => `<link rel="stylesheet" href="${c.css}">`).join("");
    const roots = cases
      .flatMap((c) => c.modes.map((mode) => `<div data-scnx-theme="${c.theme}" data-scnx-resolved-mode="${mode}"><p style="font-family: var(--ds-font-family-base)">Aa</p></div>`))
      .join("");
    response.writeHead(200, { "content-type": "text/html" }).end(`<!doctype html><html><head>${links}</head><body>${roots}</body></html>`);
    return;
  }
  const file = path.join(root, url);
  if (!file.startsWith(root) || !fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
let failures = [];
let summary;
try {
  const page = await browser.newPage();
  const missing = [];
  page.on("response", (res) => {
    if (res.status() >= 400) missing.push(`${res.status()} ${res.url()}`);
  });
  await page.goto(`${origin}/`, { waitUntil: "load" });

  ({ failures, summary } = await page.evaluate(async (cases) => {
    const failures = [];
    const normalize = (value) => value.trim().replace(/\s+/g, " ");
    let checked = 0;
    for (const c of cases) {
      for (const mode of c.modes) {
        const el = document.querySelector(`[data-scnx-theme="${c.theme}"][data-scnx-resolved-mode="${mode}"]`);
        const style = getComputedStyle(el);
        for (const token of c.tokens) {
          checked++;
          // Computed custom properties have var() references substituted.
          const declared = normalize(style.getPropertyValue(token.cssName));
          if (declared !== normalize(token.resolved[mode])) {
            failures.push(`${c.theme}/${mode} ${token.cssName}: root has "${declared}", expected "${token.resolved[mode]}"`);
          }
          if (token.property && !CSS.supports(token.property, token.resolved[mode])) {
            failures.push(`${c.theme}/${mode} ${token.cssName}: "${token.resolved[mode]}" is not a valid ${token.property} in the engine`);
          }
        }
      }
    }
    // Coexistence: two themes on one page resolve a theme-specific token differently.
    const distinct = cases.length < 2 ? [] : cases[0].tokens.filter((t) => {
      const other = cases[1].tokens.find((o) => o.cssName === t.cssName);
      return other && other.values[cases[1].modes[0]] !== t.values[cases[0].modes[0]];
    });
    if (cases.length >= 2) {
      if (distinct.length === 0) failures.push("no token differs between the first two themes; coexistence is untested");
      else {
        const [a, b] = cases;
        const name = distinct[0].cssName;
        const valueIn = (c) => getComputedStyle(document.querySelector(`[data-scnx-theme="${c.theme}"][data-scnx-resolved-mode="${c.modes[0]}"]`)).getPropertyValue(name).trim();
        if (valueIn(a) === valueIn(b)) failures.push(`${a.theme} and ${b.theme} roots resolve ${name} identically on one page`);
      }
    }
    // Fonts: every declared face loads.
    await document.fonts.ready;
    const faces = [...document.fonts];
    await Promise.all(faces.map((face) => face.load().catch(() => {})));
    for (const face of faces) {
      if (face.status !== "loaded") failures.push(`font face ${face.family} ${face.style} did not load (${face.status})`);
    }
    return { failures, summary: { declarationsChecked: checked, fontFaces: faces.map((f) => `${f.family} ${f.style}: ${f.status}`) } };
  }, cases));
  failures.push(...missing.map((m) => `HTTP ${m}`));
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  console.error(failures.slice(0, 40).join("\n"));
  console.error(`${failures.length} browser verification failure(s)`);
  process.exit(1);
}
console.log(
  `Browser verification passed: ${themes.length} themes, ${summary.declarationsChecked} declarations; fonts ${summary.fontFaces.join(", ")}`,
);
