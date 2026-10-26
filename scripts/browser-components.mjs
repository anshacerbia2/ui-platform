#!/usr/bin/env node
// PLAN P0 row 5 packed browser fixture (TDD CSS delivery, Testing Strategy
// "Packed browser", "Isolation", "Accessibility"). Installs the packed tarballs
// into a fresh project outside the workspace, server-renders the focusable
// components inside one root per theme/mode next to plain host markup, loads
// only the published stylesheets in every engine of support-matrix.json
// (Chromium, Firefox, WebKit; TDD packaging RC5), and fails unless:
// - every published stylesheet opens with the canonical layer order and every
//   style rule sits in a canonical layer;
// - host markup outside every theme root computes exactly as without the
//   UI Platform stylesheets (no reset, base, or token leakage);
// - two roots of different themes, and two modes of one theme, compute a
//   component differently on one page;
// - keyboard focus on every focusable part draws a visible outline, normally
//   and under forced colors, where the outline uses the Highlight system color;
// - every focusable part's pointer target (for CodeSelect, its wrapper) is at
//   least 24 by 24 CSS pixels (WCAG 2.2 SC 2.5.8; STD-UIP-STY-001).
// The computed tokens of every styled component, per option and state, are
// checked by scripts/browser-specs.mjs against its specification (TDD styled CS4).
//
//   node scripts/browser-components.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { browserEngines } from "./browser-engines.mjs";
import { LAYERS } from "../packages/design-system/scripts/styles/layers.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

// Focusable parts the fixture must reach by keyboard, by a selector of the part.
const FOCUSABLE = {
  Button: ".scnx-button",
  "Accordion trigger": ".scnx-accordion__trigger",
  "CodeShowcase trigger": ".scnx-code-showcase button",
  "CodeSelect input": ".scnx-code-select__input",
  "Navigation item": ".scnx-navigation__item",
  "TableOfContents link": ".scnx-table-of-contents__link",
  "TextField input": ".scnx-text-field input",
  "Tabs selected tab": ".scnx-tabs [role=tab][aria-selected=true]",
  "SegmentedControl checked segment": ".scnx-segmented-control [data-part=input]:checked",
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-browser-components-"));
const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
for (const pkg of packReport.packages) {
  dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
}
fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-browser-components", private: true, type: "module", dependencies }, null, 2));
execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

const manifest = JSON.parse(fs.readFileSync(path.join(dir, "node_modules/@scnx/system/package.json"), "utf8"));
const themes = Object.keys(manifest.exports).map((s) => /^\.\/tokens\/css\/([a-z0-9-]+)\.css$/.exec(s)?.[1]).filter(Boolean);
const stylesheets = ["./styles/components.css", ...themes.map((t) => `./tokens/css/${t}.css`)].map((subpath) => {
  const target = manifest.exports[subpath];
  if (typeof target !== "string") throw new Error(`@scnx/system does not export ${subpath}`);
  return `/node_modules/@scnx/system/${target.replace(/^\.\//, "")}`;
});

// Server rendering from the installed packages: the consumer's own resolution.
fs.writeFileSync(path.join(dir, "render.mjs"), `import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@scnx/system/components/button";
import { IconButton } from "@scnx/system/components/icon-button";
import { Alert } from "@scnx/system/components/alert";
import { Badge } from "@scnx/system/components/badge";
import { Accordion } from "@scnx/system/components/accordion";
import { CodeShowcase } from "@scnx/system/components/code-showcase";
import { CodeSelect } from "@scnx/system/components/code-select";
import { Navigation } from "@scnx/system/components/navigation";
import { TableOfContents } from "@scnx/system/components/table-of-contents";
import { TextField } from "@scnx/system/components/text-field";
import { Tabs } from "@scnx/system/components/tabs";
import { SegmentedControl } from "@scnx/system/components/segmented-control";
import { Kbd } from "@scnx/system/components/kbd";
import { Surface } from "@scnx/system/components/surface";
import { Table } from "@scnx/system/components/table";
import { Link } from "@scnx/system/components/link";

const modes = ${JSON.stringify(["light", "dark"])};
const themes = ${JSON.stringify(themes)};
const set = () => h("div", null,
  h(Button, { variant: "primary" }, "Primary"),
  h(Button, { variant: "secondary", href: "#link" }, "Link"),
  h(Button, { variant: "primary", disabled: true }, "Primary disabled"),
  h(Button, { variant: "secondary", disabled: true }, "Secondary disabled"),
  h(IconButton, { "aria-label": "Close", variant: "primary" }, "×"),
  h(IconButton, { "aria-label": "Settings", variant: "secondary", size: "small" }, "⚙"),
  h(IconButton, { "aria-label": "More", variant: "ghost" }, "…"),
  h(IconButton, { "aria-label": "Docs", variant: "ghost", href: "#docs" }, "?"),
  h(Badge, { scheme: "success" }, "Live"),
  h(Alert, { scheme: "warning", title: "Heads up", actions: h(Button, { variant: "secondary", href: "#alert" }, "Details") }, "Alert body"),
  h(Accordion, null, h(Accordion.Item, { value: "a" }, h(Accordion.Trigger, null, "Section"), h(Accordion.Content, null, "Body"))),
  h(CodeShowcase, null, h(CodeShowcase.Nav, null, h(CodeShowcase.Trigger, null, "Code")), h(CodeShowcase.Preview, null, "Preview"), h(CodeShowcase.Content, null, "const a = 1;")),
  h(CodeSelect, { options: [{ id: "ts", title: "TypeScript" }], value: "ts", onChange: () => {} }),
  h(Navigation, null, h(Navigation.Group, null, h(Navigation.Item, { href: "#nav" }, h(Navigation.Text, null, "Dashboard")))),
  h(TableOfContents, { items: [{ id: "intro", title: "Intro", url: "#intro" }] }),
  h(TextField, { label: "Email", description: "Work address", error: "Enter an email address" }),
  h(Tabs, { defaultValue: "a" }, h(Tabs.List, { "aria-label": "Sections" }, h(Tabs.Tab, { value: "a" }, "A"), h(Tabs.Tab, { value: "b" }, "B")), h(Tabs.Panel, { value: "a", tabIndex: -1 }, "Panel A"), h(Tabs.Panel, { value: "b", tabIndex: -1 }, "Panel B")),
  h(SegmentedControl, { "aria-label": "Range", defaultValue: "7d" }, h(SegmentedControl.Item, { value: "24h" }, "24h"), h(SegmentedControl.Item, { value: "7d" }, "7 days")),
  h("p", null, h(Kbd, null, "⌘"), h(Kbd, null, "K")),
  h(Surface, { as: "section", material: "panel", padding: "compact", "aria-label": "Panel" }, h(Surface, { material: "flat", padding: "default" }, "Flat"), h(Surface, { material: "well", padding: "default" }, "Well")),
  h(Table, { "aria-label": "People" }, h(Table.Head, null, h(Table.Row, null, h(Table.HeaderCell, { sort: "ascending" }, "Name"), h(Table.HeaderCell, { align: "end" }, "Salary"))), h(Table.Body, null, h(Table.Row, null, h(Table.Cell, null, "Ana"), h(Table.Cell, { align: "end" }, "12,500")), h(Table.Row, { selected: true }, h(Table.Cell, { muted: true }, "Budi"), h(Table.Cell, { align: "end" }, "9,800")))),
  h("p", null, "Read the ", h(Link, { href: "#changelog" }, "changelog"), ", the ", h(Link, { href: "#terms", variant: "neutral" }, "terms"), ", or the ", h(Link, { href: "#npm", external: true }, "npm package"), "."),
);
const roots = themes.flatMap((theme) => modes.map((mode) =>
  h("div", { "data-scnx-theme": theme, "data-scnx-resolved-mode": mode, "data-fixture-root": theme + "/" + mode }, set())));
// Host markup also carries class names common in host frameworks (Bootstrap, Tailwind): a UI
// Platform class must not match them (TDD styled RN1).
const host = h("div", { id: "host" }, h("h1", null, "Host"), h("p", null, "Host text"), h("button", null, "Host button"), h("a", { href: "#host" }, "Host link"), h("input", { "aria-label": "Host input" }),
  h("div", { className: "container" }, h("div", { className: "flex grid" }, h("p", { className: "text" }, "Host class text"), h("h2", { className: "heading" }, "Host class heading"), h("code", { className: "code" }, "host"), h("ul", { className: "list" }, h("li", { className: "list-item" }, "Host item")))));
process.stdout.write(renderToStaticMarkup(h("main", null, host, ...roots)));
`);
const body = execSync("node render.mjs", { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const page = (withStyles) =>
  `<!doctype html><html><head><meta charset="utf-8">${withStyles ? stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join("") : ""}</head><body>${body}</body></html>`;
const TYPES = { ".css": "text/css", ".woff2": "font/woff2", ".html": "text/html" };
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (url === "/" || url === "/control") {
    response.writeHead(200, { "content-type": "text/html" }).end(page(url === "/"));
    return;
  }
  const file = path.join(dir, url);
  if (!file.startsWith(dir) || !fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const HOST_PROPERTIES = ["box-sizing", "margin-top", "padding-top", "font-family", "font-size", "line-height", "color", "background-color", "border-top-style", "text-decoration-line", "display", "flex-direction", "max-width", "width", "margin-left", "padding-left", "row-gap", "font-weight", "border-top-width"];
const hostStyles = (properties) =>
  [...document.querySelectorAll("#host, #host *")].map((el) => {
    const style = getComputedStyle(el);
    return [el.tagName, ...properties.map((p) => `${p}=${style.getPropertyValue(p)}`)].join(" ");
  });

/** Tab through the page; for each focused part inside a theme root, its outline. */
async function focusWalk(tab) {
  const seen = [];
  await tab.evaluate(() => document.activeElement?.blur());
  for (let i = 0; i < 200; i++) {
    await tab.keyboard.press("Tab");
    const state = await tab.evaluate((parts) => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const root = el.closest("[data-fixture-root]");
      const ring = el.closest(".scnx-segmented-control > [data-part=item]") ?? el;
      const style = getComputedStyle(ring);
      return {
        root: root?.getAttribute("data-fixture-root") ?? null,
        part: Object.entries(parts).find(([, selector]) => el.matches(selector))?.[0] ?? `${el.tagName.toLowerCase()}${[...el.classList].map((c) => `.${c}`).join("")}`,
        focusVisible: el.matches(":focus-visible"),
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
        outlineColor: style.outlineColor,
        // The pointer target: the part itself, or the ancestor that receives the pointer.
        ...(() => {
          const target = el.closest(".scnx-code-select__wrapper") ?? el.closest(".scnx-segmented-control > [data-part=item]") ?? el;
          const box = target.getBoundingClientRect();
          return { width: box.width, height: box.height };
        })(),
        key: el.outerHTML.slice(0, 80) + "@" + (root?.getAttribute("data-fixture-root") ?? "host"),
      };
    }, FOCUSABLE);
    if (!state) break;
    if (seen.some((s) => s.key === state.key)) break;
    seen.push(state);
  }
  return seen;
}

const failures = [];
const result = { scenario: "packed-browser-components", themes, stylesheets, engines: [] };
for (const engine of browserEngines()) {
  const browser = await engine.type.launch();
  try {
    const checked = await verify(browser);
    failures.push(...checked.failures.map((failure) => `${engine.name}: ${failure}`));
    result.engines.push({ engine: engine.name, version: browser.version(), checks: checked.checks });
  } finally {
    await browser.close();
  }
}
server.close();

async function verify(browser) {
  const failures = [];
  const result = { checks: [] };
  const tab = await browser.newPage();
  const missing = [];
  tab.on("response", (res) => {
    if (res.status() >= 400) missing.push(`${res.status()} ${res.url()}`);
  });

  // Host isolation: the same markup with and without the UI Platform CSS.
  await tab.goto(`${origin}/control`, { waitUntil: "load" });
  const control = await tab.evaluate(hostStyles, HOST_PROPERTIES);
  await tab.goto(`${origin}/`, { waitUntil: "load" });
  failures.push(...missing.map((m) => `HTTP ${m}`));
  const styled = await tab.evaluate(hostStyles, HOST_PROPERTIES);
  control.forEach((line, i) => {
    if (styled[i] !== line) failures.push(`host markup outside every theme root changed:\n  without: ${line}\n  with:    ${styled[i]}`);
  });
  result.checks.push({ check: "host-isolation", elements: control.length });

  // Layers as the engine parsed them.
  const layerFindings = await tab.evaluate((layers) => {
    const findings = [];
    for (const sheet of document.styleSheets) {
      const rules = [...sheet.cssRules];
      const first = rules[0];
      if (!(first instanceof CSSLayerStatementRule) || first.nameList.join() !== layers.join()) {
        findings.push(`${sheet.href}: first rule is not the canonical layer order`);
      }
      const visit = (list, layer) => {
        for (const rule of list) {
          if (rule instanceof CSSLayerBlockRule) {
            if (layer) findings.push(`${sheet.href}: layer ${rule.name} nested in ${layer}`);
            else if (!layers.includes(rule.name)) findings.push(`${sheet.href}: undeclared layer ${rule.name}`);
            visit(rule.cssRules, layer ?? rule.name);
          } else if (rule instanceof CSSStyleRule) {
            if (!layer) findings.push(`${sheet.href}: unlayered rule ${rule.selectorText}`);
          } else if (rule.cssRules) {
            visit(rule.cssRules, layer);
          }
        }
      };
      visit(rules, null);
    }
    return findings;
  }, LAYERS);
  failures.push(...layerFindings);
  result.checks.push({ check: "layers", stylesheets: stylesheets.length });

  // Coexistence: themes and modes resolve in their own roots on one page. The
  // primary Button's corner radius tells the themes apart: its ink fill is the
  // same neutral solid in every theme (ADR-UIP-VIS-001 item 3), while the
  // radius ladder is theme-specific (12px control in default, 8px in
  // scnx-saas). The secondary Button's raised surface, which the token
  // doctrine makes mode-dependent, tells the modes apart. The specification
  // check (CS4) proves each root computes its own token, so it is not
  // restated here.
  const backgrounds = await tab.evaluate(() =>
    Object.fromEntries([...document.querySelectorAll("[data-fixture-root]")].flatMap((root) => {
      const id = root.getAttribute("data-fixture-root");
      const enabled = (variant) => root.querySelector(`.scnx-button[data-variant="${variant}"]:not([data-disabled]):not(:disabled)`);
      return [
        // Themes differ only in colour (ADR-UIP-VIS-001 item 7): the selected tab's indicator is the
        // primary scheme's solid, Scnx Blue in one theme and ink in scnx-saas.
        [`${id}/primary-signal`, getComputedStyle(root.querySelector(".scnx-tabs [role=tab][aria-selected=true]"), "::after").borderBottomColor],
        [`${id}/secondary`, getComputedStyle(enabled("secondary")).backgroundColor],
      ];
    })));
  const differ = (a, b) => backgrounds[a] && backgrounds[b] && backgrounds[a] !== backgrounds[b];
  if (themes.length > 1 && !differ(`${themes[0]}/light/primary-signal`, `${themes[1]}/light/primary-signal`)) {
    failures.push(`the selected tab's indicator computes the same colour in ${themes[0]} and ${themes[1]} roots on one page`);
  }
  for (const theme of themes) {
    if (!differ(`${theme}/light/secondary`, `${theme}/dark/secondary`)) failures.push(`secondary Button computes the same background in light and dark ${theme} roots`);
  }
  result.checks.push({ check: "coexistence", backgrounds });

  // Focus indicators, normally and under forced colors.
  for (const forcedColors of ["none", "active"]) {
    await tab.emulateMedia({ forcedColors });
    await tab.goto(`${origin}/`, { waitUntil: "load" });
    const highlight = await tab.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "Highlight";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    const focused = (await focusWalk(tab)).filter((state) => state.root);
    const reached = new Set();
    for (const state of focused) {
      reached.add(`${state.part}@${state.root}`);
      const where = `${forcedColors === "active" ? "forced colors: " : ""}${state.part} in ${state.root}`;
      if (!state.focusVisible) failures.push(`${where}: keyboard focus does not match :focus-visible`);
      if (state.outlineStyle === "none" || !(state.outlineWidth >= 1)) {
        failures.push(`${where}: no visible outline (${state.outlineStyle} ${state.outlineWidth}px)`);
      }
      // WCAG 2.2 SC 2.5.8; STD-UIP-STY-001, "Governed values".
      if (Math.min(state.width, state.height) < 24) {
        failures.push(`${where}: pointer target ${state.width.toFixed(1)} x ${state.height.toFixed(1)} CSS px is below 24 x 24 (WCAG 2.2 SC 2.5.8)`);
      }
      if (forcedColors === "active" && state.outlineColor !== highlight) {
        failures.push(`${where}: outline color ${state.outlineColor} is not Highlight (${highlight})`);
      }
    }
    for (const theme of themes) {
      for (const mode of ["light", "dark"]) {
        for (const label of Object.keys(FOCUSABLE)) {
          if (!reached.has(`${label}@${theme}/${mode}`)) failures.push(`${forcedColors === "active" ? "forced colors: " : ""}${label} in ${theme}/${mode} was never reached by keyboard focus`);
        }
      }
    }
    result.checks.push({ check: `focus-visible-forced-colors-${forcedColors}`, focused: focused.length });
  }
  return { failures, checks: result.checks };
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "browser-components-report.json"), `${JSON.stringify({ ...result, failures }, null, 2)}\n`);
if (failures.length > 0) {
  console.error(failures.slice(0, 40).join("\n"));
  console.error(`${failures.length} component browser failure(s)`);
  process.exit(1);
}
console.log(
  `Component browser fixture passed: ${themes.length} themes x 2 modes; ${result.engines
    .map((e) => `${e.engine} ${e.version}: ${e.checks.map((c) => (c.focused !== undefined ? `${c.check} ${c.focused} parts` : c.check)).join(", ")}`)
    .join("; ")}`,
);
