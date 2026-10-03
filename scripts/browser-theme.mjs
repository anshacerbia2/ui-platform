#!/usr/bin/env node
// PLAN P0 row 6 packed browser fixture (TDD theme, Testing Strategy
// "SSR/hydration" and "CSP"). Installs the packed tarballs into a fresh
// project, server-renders a ThemeProvider page, and hydrates it with an
// external bundle under a strict Content Security Policy:
//   default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'
// It fails unless, in Chromium:
// - hydration reports no mismatch and the page records zero CSP violations;
// - the stored preference applies after hydration, a mode change updates
//   only its own root, persists, and survives a reload;
// - an Accordion opens and closes through its real transitionend
//   (closed -> entering -> settled -> exiting -> unmounted), and under
//   prefers-reduced-motion it settles without an entering/exiting phase;
// - the behavior inventory (packages/core-ui/behavior-inventory.json) holds
//   for the packed entries: every part resolves to its element and every
//   key produces its expected ARIA state (TDD primitives P12);
// - a negative page with an inline script is reported as a violation, which
//   proves violations are detected at all.
//
//   node scripts/browser-theme.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

// The workspace's esbuild (a root devDependency) bundles the consumer app;
// it resolves imports from the consumer project, so the bundle uses the packs.
const esbuild = createRequire(path.resolve("package.json"))("esbuild");

const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-browser-theme-"));
const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-browser-theme", private: true, type: "module", dependencies }, null, 2));
execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

// One module renders the same tree on the server and hydrates it on the client.
fs.writeFileSync(path.join(dir, "app.jsx"), `import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@scnx/core-ui/providers/theme-provider-base";
import { Accordion } from "@scnx/system/components/accordion";
import { ButtonBase } from "@scnx/core-ui/components/button-base";
import { AccordionBase } from "@scnx/core-ui/components/accordion-base";
import { NavigationBase } from "@scnx/core-ui/components/navigation-base";
import { TableOfContentsBase } from "@scnx/core-ui/components/table-of-contents-base";
import { SidebarBaseRoot, SidebarBaseToggle } from "@scnx/core-ui/components/sidebar-base";
import { BehaviorFixtures } from "./behavior-fixtures.tsx";

const Toggle = ({ id }) => {
  const theme = useTheme();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <button id={id} type="button" data-hydrated={hydrated ? "" : undefined} onClick={() => theme.setMode(theme.resolvedMode === "dark" ? "light" : "dark")}>
      {theme.themeId} {theme.mode}
    </button>
  );
};

export const App = () => (
  <main>
    <ThemeProvider themeId="default" defaultMode="light">
      <Toggle id="first" />
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Trigger data-fixture="accordion-trigger">Section</Accordion.Trigger>
          <Accordion.Content data-fixture="accordion-content"><p>Body</p></Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </ThemeProvider>
    <ThemeProvider themeId="achromatic" defaultMode="light" storage={false}><Toggle id="second" /></ThemeProvider>
    {/* Server-rendered: its markup carries no style attribute (TDD theme THM-009). */}
    <div data-behavior-matrix="">
      <BehaviorFixtures components={{ ButtonBase, AccordionBase, NavigationBase, TableOfContentsBase, SidebarBaseRoot, SidebarBaseToggle }} />
    </div>
  </main>
);
`);
fs.copyFileSync(path.resolve("packages/core-ui/test/behavior-fixtures.tsx"), path.join(dir, "behavior-fixtures.tsx"));
const inventory = JSON.parse(fs.readFileSync(path.resolve("packages/core-ui/behavior-inventory.json"), "utf8"));
fs.writeFileSync(path.join(dir, "client.jsx"), `import { hydrateRoot } from "react-dom/client";
import { App } from "./app.jsx";
window.__hydrationErrors = [];
hydrateRoot(document.getElementById("app"), <App />, { onRecoverableError: (error) => window.__hydrationErrors.push(String(error)) });
`);
fs.writeFileSync(path.join(dir, "server.jsx"), `import { renderToString } from "react-dom/server";
import { App } from "./app.jsx";
process.stdout.write(renderToString(<App />));
`);
const build = (entry, outfile, platform) =>
  esbuild.buildSync({ entryPoints: [path.join(dir, entry)], outfile: path.join(dir, outfile), bundle: true, format: platform === "node" ? "cjs" : "esm", platform, jsx: "automatic", absWorkingDir: dir, logLevel: "error", define: { "process.env.NODE_ENV": '"production"' } });
build("client.jsx", "client.js", "browser");
build("server.jsx", "server.cjs", "node");
const markup = execSync("node server.cjs", { cwd: dir, encoding: "utf8" });

const systemDist = path.join(dir, "node_modules/@scnx/system");
const manifest = JSON.parse(fs.readFileSync(path.join(systemDist, "package.json"), "utf8"));
const assets = ["./styles/components.css", "./tokens/css/default.css", "./tokens/css/achromatic.css"].map((subpath) => manifest.exports[subpath].replace(/^\.\//, ""));
const links = assets.map((file) => `<link rel="stylesheet" href="/pkg/${file}">`).join("");
const pages = {
  "/": `<!doctype html><html><head><meta charset="utf-8">${links}<script type="module" src="/client.js"></script></head><body><div id="app">${markup}</div></body></html>`,
  "/negative": `<!doctype html><html><head><meta charset="utf-8"></head><body><script>document.body.dataset.inline = "ran";</script></body></html>`,
};
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost").pathname;
  const headers = { "content-security-policy": CSP };
  if (pages[url]) return response.writeHead(200, { ...headers, "content-type": "text/html" }).end(pages[url]);
  if (url === "/favicon.ico") return response.writeHead(204, headers).end();
  if (url.startsWith("/pkg/")) {
    const file = path.join(systemDist, url.slice("/pkg/".length));
    if (file.startsWith(systemDist) && fs.existsSync(file)) {
      const type = file.endsWith(".css") ? "text/css" : file.endsWith(".woff2") ? "font/woff2" : "application/octet-stream";
      return response.writeHead(200, { ...headers, "content-type": type }).end(fs.readFileSync(file));
    }
  }
  if (url === "/client.js") return response.writeHead(200, { ...headers, "content-type": "text/javascript" }).end(fs.readFileSync(path.join(dir, "client.js")));
  response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const failures = [];
const checks = [];
try {
  const context = await browser.newContext();
  // Collected outside the page's CSP: init scripts are injected by the driver.
  await context.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => window.__cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`));
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  const attrs = () =>
    page.evaluate(() => [...document.querySelectorAll("[data-scnx-theme]")].map((el) => `${el.getAttribute("data-scnx-theme")}/${el.getAttribute("data-scnx-resolved-mode")}`));
  const hydrated = () => page.waitForFunction(() => document.querySelectorAll("button[data-hydrated]").length === 2, null, { timeout: 15000 });

  // Stored preference: dark for the first root (the second has no storage).
  await page.goto(`${origin}/`);
  await page.evaluate(() => localStorage.setItem("scnx-theme-mode", "dark"));
  await page.goto(`${origin}/`);
  const serverAttrs = [...markup.matchAll(/data-scnx-theme="([^"]+)" data-scnx-resolved-mode="([^"]+)"/g)].map((m) => `${m[1]}/${m[2]}`);
  if (serverAttrs.join() !== "default/light,achromatic/light") failures.push(`server markup roots are ${serverAttrs.join()}`);
  await hydrated();
  let now = await attrs();
  if (now.join() !== "default/dark,achromatic/light") failures.push(`after hydration with a stored preference, roots are ${now.join()}`);
  checks.push({ check: "hydrate-then-persisted", roots: now });

  await page.click("#first");
  now = await attrs();
  if (now.join() !== "default/light,achromatic/light") failures.push(`after toggling the first root, roots are ${now.join()}`);
  await page.click("#second");
  now = await attrs();
  if (now.join() !== "default/light,achromatic/dark") failures.push(`toggling the second root changed another root: ${now.join()}`);
  const stored = await page.evaluate(() => localStorage.getItem("scnx-theme-mode"));
  if (stored !== "light") failures.push(`the first root persisted "${stored}", expected "light"`);
  checks.push({ check: "isolated-mode-change", roots: now, stored });

  await page.reload();
  await hydrated();
  now = await attrs();
  if (now.join() !== "default/light,achromatic/light") failures.push(`after reload, roots are ${now.join()}`);

  // Transitions in the engine: record every data-state the content passes through.
  const watch = () =>
    page.evaluate(() => {
      window.__phases = [];
      const record = () => {
        const content = document.querySelector("[data-fixture='accordion-content']");
        const phase = content ? content.getAttribute("data-state") : "unmounted";
        if (window.__phases[window.__phases.length - 1] !== phase) window.__phases.push(phase);
      };
      new MutationObserver(record).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
      record();
    });
  const phases = () => page.evaluate(() => window.__phases);
  const settledTo = (phase) =>
    page.waitForFunction((want) => window.__phases[window.__phases.length - 1] === want, phase, { timeout: 10000 });

  await watch();
  await page.click("[data-fixture='accordion-trigger']");
  await settledTo("settled");
  await page.click("[data-fixture='accordion-trigger']");
  await settledTo("unmounted");
  const animated = await phases();
  if (animated.join(" ") !== "unmounted closed entering settled exiting unmounted") failures.push(`animated accordion passed through: ${animated.join(" ")}`);
  checks.push({ check: "transition-events", phases: animated });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await watch();
  await page.click("[data-fixture='accordion-trigger']");
  await settledTo("settled");
  await page.click("[data-fixture='accordion-trigger']");
  await settledTo("unmounted");
  const reduced = await phases();
  if (reduced.includes("entering") || reduced.includes("exiting")) failures.push(`reduced-motion accordion passed through: ${reduced.join(" ")}`);
  checks.push({ check: "transition-reduced-motion", phases: reduced });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  // Packed behavior matrix from the inventory.
  await page.waitForSelector("[data-behavior-matrix]");
  const PRESS = { Enter: "Enter", Space: "Space" };
  let keysChecked = 0;
  for (const record of inventory.primitives) {
    const selectorOf = (name) => record.parts.find((p) => p.name === name).selector;
    for (const p of record.parts) {
      const tag = await page.evaluate((s) => document.querySelector(s)?.tagName.toLowerCase() ?? null, p.selector);
      if (tag !== p.element) failures.push(`behavior matrix: ${record.name} part ${p.name} is ${tag}, expected ${p.element}`);
    }
    for (const key of record.keys) {
      if (!key.expect) continue;
      if (PRESS[key.key]) {
        await page.focus(selectorOf(key.part));
        await page.keyboard.press(PRESS[key.key]);
      }
      const value = await page.evaluate(([s, a]) => document.querySelector(s)?.getAttribute(a) ?? null, [selectorOf(key.expect.part), key.expect.attribute]);
      keysChecked++;
      if (value !== key.expect.value) failures.push(`behavior matrix: ${record.name} ${key.key} on ${key.part} (${key.effect}): ${key.expect.attribute}=${value}, expected ${key.expect.value}`);
    }
  }
  checks.push({ check: "packed-behavior-matrix", primitives: inventory.primitives.length, keys: keysChecked });

  const violations = await page.evaluate(() => window.__cspViolations);
  const hydrationErrors = await page.evaluate(() => window.__hydrationErrors);
  failures.push(...violations.map((v) => `CSP violation: ${v}`));
  failures.push(...hydrationErrors.map((e) => `hydration: ${e}`));
  failures.push(...consoleErrors.map((e) => `console: ${e}`));
  checks.push({ check: "strict-csp", violations: violations.length, hydrationErrors: hydrationErrors.length });

  // Negative control: the same policy must block and report an inline script.
  await page.goto(`${origin}/negative`);
  const negative = await page.evaluate(() => ({ ran: document.body.dataset.inline === "ran", violations: window.__cspViolations.length }));
  if (negative.ran || negative.violations === 0) failures.push(`negative control: inline script ${negative.ran ? "ran" : "was blocked"} with ${negative.violations} violation(s); the CSP check is not effective`);
  checks.push({ check: "csp-negative-control", ...negative });
} finally {
  await browser.close();
  server.close();
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "browser-theme-report.json"), `${JSON.stringify({ scenario: "packed-browser-theme", csp: CSP, checks, failures }, null, 2)}\n`);
if (failures.length > 0) {
  console.error(failures.join("\n"));
  console.error(`${failures.length} theme browser failure(s)`);
  process.exit(1);
}
console.log(`Theme browser fixture passed under "${CSP}": ${checks.map((c) => c.check).join(", ")}`);
