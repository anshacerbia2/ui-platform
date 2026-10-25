#!/usr/bin/env node
// PLAN P3 interaction traces (STD-UIP-ENG-001 2.3.0 section 3.3; TDD theme
// X1-X5). Installs the packed tarballs into a fresh project, renders every
// shipped dynamic-height transition (Accordion, Sidebar sub-navigation,
// CodeShowcase; all through TransitionBase) and a theme-mode toggle inside a
// ThemeProvider with the published stylesheets, and drives each with real
// pointer input (no script-side click, which Event Timing ignores and which
// would add the driver's own layout to the trace):
// - in Chromium, each interaction runs under a trace; a forced layout is a
//   Layout event nested inside a script task between two performance marks,
//   and long animation frames (50 ms or more) are recorded;
// - in every engine, the theme toggle's Event Timing duration is recorded
//   when the engine reports it (entries start at 16 ms).
// Scenarios: open, close, and open reversed mid-transition, normally and with
// reduced motion. The design claims of TDD theme X3 are gates: no forced
// layout and no transition phase with reduced motion, and at most one forced
// layout per animated open, close, or reversal.
// Everything else is evidence.
//
//   node scripts/interaction-traces.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>] [--runs <n>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { browserEngines } from "./browser-engines.mjs";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const RUNS = Number(arg("--runs", "5"));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");
const esbuild = createRequire(path.resolve("package.json"))("esbuild");

// TDD theme X3: the claims this script gates.
const MAX_FORCED_ANIMATED = 1;
const MAX_FORCED_REDUCED = 0;

const TRANSITIONS = {
  accordion: { trigger: "#accordion .scnx-accordion__trigger", root: "#accordion" },
  "sidebar-group": { trigger: "#sidebar >> text=Payroll", root: "#sidebar" },
  "code-showcase": { trigger: "#showcase >> role=button[name=\"Code\"]", root: "#showcase" },
};
const SCRIPT_TASKS = new Set(["EventDispatch", "FunctionCall", "FireAnimationFrame", "TimerFire", "RunMicrotasks", "v8.callFunction", "EvaluateScript"]);

const APP = `import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "@scnx/core-ui/providers/theme-provider-base";
import { Accordion } from "@scnx/system/components/accordion";
import { CodeShowcase } from "@scnx/system/components/code-showcase";
import { Sidebar, SidebarProvider } from "@scnx/system/components/sidebar";

const ModeToggle = () => {
  const { resolvedMode, setMode } = useTheme();
  return <button id="mode" type="button" onClick={() => setMode(resolvedMode === "dark" ? "light" : "dark")}>Switch mode</button>;
};

const App = () => (
  <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
    <ModeToggle />
    <div id="accordion">
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Trigger>Payroll schedule</Accordion.Trigger>
          <Accordion.Content><p>Runs close on the 25th.</p><p>Payslips publish two days later.</p></Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
    <div id="sidebar" style={{ height: "24rem", display: "flex" }}>
      <SidebarProvider activePath="#people">
        <Sidebar>
          <Sidebar.Nav aria-label="Main">
            <Sidebar.Nav.Group>
              <Sidebar.Nav.Item href="#people" label="People" />
              <Sidebar.Nav.Item label="Payroll" id="payroll">
                <Sidebar.Nav.Group>
                  <Sidebar.Nav.Item href="#runs" label="Runs" />
                  <Sidebar.Nav.Item href="#payslips" label="Payslips" />
                </Sidebar.Nav.Group>
              </Sidebar.Nav.Item>
            </Sidebar.Nav.Group>
          </Sidebar.Nav>
        </Sidebar>
      </SidebarProvider>
    </div>
    <div id="showcase">
      <CodeShowcase>
        <CodeShowcase.Nav><CodeShowcase.Trigger>Code</CodeShowcase.Trigger></CodeShowcase.Nav>
        <CodeShowcase.Preview>Preview</CodeShowcase.Preview>
        <CodeShowcase.Content>const run = "2026-10";</CodeShowcase.Content>
      </CodeShowcase>
    </div>
  </ThemeProvider>
);

createRoot(document.getElementById("root")).render(<App />);
`;

// In-page helpers: a window between two marks that ends once every
// TransitionBase element under the root has settled for two frames, and the
// long animation frames inside it.
const HARNESS = `window.__scnx = {
  loaf: [],
  observe() {
    try {
      new PerformanceObserver((list) => window.__scnx.loaf.push(...list.getEntries())).observe({ type: "long-animation-frame", buffered: true });
    } catch {}
    window.__scnx.events = [];
    try {
      new PerformanceObserver((list) => window.__scnx.events.push(...list.getEntries())).observe({ type: "event", durationThreshold: 16, buffered: true });
    } catch { window.__scnx.noEventTiming = true; }
  },
  arm(rootSelector) {
    const root = document.querySelector(rootSelector);
    performance.mark("scnx-start");
    window.__scnx.done = new Promise((resolve) => {
      let saw = false, quiet = 0, frames = 0;
      const moving = () => root.querySelector('[data-state="entering"],[data-state="exiting"]');
      const tick = () => {
        frames++;
        if (moving()) { saw = true; quiet = 0; } else quiet++;
        if ((saw && quiet >= 2) || (!saw && frames >= 8) || frames > 600) {
          performance.mark("scnx-end");
          const start = performance.getEntriesByName("scnx-start").at(-1).startTime;
          const end = performance.getEntriesByName("scnx-end").at(-1).startTime;
          const loaf = window.__scnx.loaf.filter((e) => e.startTime >= start && e.startTime <= end).map((e) => Math.round(e.duration));
          resolve({ animated: saw, frames, loaf });
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
};
`;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** Layout events nested in a script task between the two marks of the last window. */
function forcedLayouts(events) {
  const starts = events.filter((e) => e.name === "scnx-start");
  const ends = events.filter((e) => e.name === "scnx-end");
  const start = starts.at(-1)?.ts;
  const end = ends.at(-1)?.ts;
  if (start === undefined || end === undefined) throw new Error("trace has no scnx-start/scnx-end marks");
  const scripts = events.filter((e) => e.ph === "X" && SCRIPT_TASKS.has(e.name));
  return events.filter(
    (e) => e.ph === "X" && e.name === "Layout" && e.ts >= start && e.ts <= end &&
      scripts.some((s) => s.pid === e.pid && s.tid === e.tid && s.ts <= e.ts && e.ts + e.dur <= s.ts + s.dur),
  ).length;
}

const report = {
  schemaVersion: 1,
  purpose: "STD-UIP-ENG-001 3.3 interaction traces; TDD theme X3 claims are gates, everything else is evidence",
  runs: RUNS,
  claims: { maxForcedLayoutsAnimated: MAX_FORCED_ANIMATED, maxForcedLayoutsReducedMotion: MAX_FORCED_REDUCED },
  runner: { os: `${os.type()} ${os.release()} ${os.arch()}`, cpu: `${os.cpus().length} x ${os.cpus()[0]?.model ?? "unknown"}`, node: process.version },
  transitions: [],
  themeSwitch: [],
};
const failures = [];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-traces-"));
let server;
try {
  const dependencies = { react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
  for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "scnx-traces", private: true, type: "module", dependencies }, null, 2));
  execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  fs.writeFileSync(path.join(dir, "app.jsx"), APP);
  esbuild.buildSync({
    entryPoints: [path.join(dir, "app.jsx")], outfile: path.join(dir, "out/app.js"), bundle: true, minify: true, format: "esm",
    platform: "browser", jsx: "automatic", absWorkingDir: dir, logLevel: "error", define: { "process.env.NODE_ENV": '"production"' },
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "node_modules/@scnx/system/package.json"), "utf8"));
  const css = ["./styles/components.css", "./tokens/css/scnx-platform.css"].map((s) => `/node_modules/@scnx/system/${manifest.exports[s].replace(/^\.\//, "")}`);
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Interaction traces</title>${css.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}<script src="/harness.js"></script></head><body><div id="root"></div><script type="module" src="/out/app.js"></script></body></html>`;
  const TYPES = { ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2" };
  server = http.createServer((request, response) => {
    const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (url === "/") return response.writeHead(200, { "content-type": "text/html" }).end(page);
    if (url === "/harness.js") return response.writeHead(200, { "content-type": "text/javascript" }).end(HARNESS);
    const file = path.join(dir, url);
    if (file.startsWith(dir) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      return response.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(fs.readFileSync(file));
    }
    response.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const open = async (browser, reducedMotion) => {
    const context = await browser.newContext({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
    const tab = await context.newPage();
    await tab.goto(origin);
    await tab.locator("#showcase >> role=button[name=\"Code\"]").waitFor();
    // Mount transitions (an item open at mount animates in) settle first.
    await tab.waitForFunction(() => !document.querySelector('[data-state="entering"],[data-state="exiting"]'));
    await tab.evaluate(() => window.__scnx.observe());
    return { context, tab };
  };
  const center = async (tab, selector) => {
    const box = await tab.locator(selector).first().boundingBox();
    if (!box) throw new Error(`${selector} is not visible`);
    return [box.x + box.width / 2, box.y + box.height / 2];
  };

  for (const engine of browserEngines()) {
    const browser = await engine.type.launch();
    try {
      // Transitions: Chromium only, where the trace exists (STD-UIP-ENG-001 [18]).
      if (engine.name === "chromium") {
        // Negative control: two reads after two writes must count as two forced
        // layouts, which proves the detector.
        {
          const { context, tab } = await open(browser, false);
          await browser.startTracing(tab, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"] });
          await tab.evaluate(() => new Promise((resolve) => setTimeout(() => {
            performance.mark("scnx-start");
            const probe = document.getElementById("root");
            probe.style.paddingTop = "1px";
            probe.getBoundingClientRect();
            probe.style.paddingTop = "2px";
            void probe.offsetHeight;
            probe.style.paddingTop = "";
            performance.mark("scnx-end");
            resolve();
          }, 20)));
          const caught = forcedLayouts(JSON.parse((await browser.stopTracing()).toString()).traceEvents);
          report.negativeControl = { expectedAtLeast: 2, forcedLayouts: caught };
          if (caught < 2) failures.push(`negative control: ${caught} forced layouts detected for two forced reads; the detector does not work`);
          await context.close();
        }
        for (const [name, scenario] of Object.entries(TRANSITIONS)) {
          for (const reducedMotion of [false, true]) {
            for (const action of ["open", "close", "reversed"]) {
              const samples = [];
              for (let run = 0; run < RUNS; run++) {
                const { context, tab } = await open(browser, reducedMotion);
                const [x, y] = await center(tab, scenario.trigger);
                // Bring the transition to the state the action starts from, outside the traced window.
                const isOpen = () => tab.evaluate((root) => !!document.querySelector(root).querySelector('[data-state="settled"]'), scenario.root);
                if ((await isOpen()) !== (action === "close")) {
                  await tab.mouse.click(x, y);
                  await tab.evaluate((root) => { window.__scnx.arm(root); return window.__scnx.done; }, scenario.root);
                }
                if ((await isOpen()) !== (action === "close")) {
                  const states = await tab.evaluate((root) => [...document.querySelector(root).querySelectorAll("[data-state]")].map((e) => `${e.tagName.toLowerCase()}.${e.className.split(" ")[0]}=${e.dataset.state}`).join(", "), scenario.root);
                  throw new Error(`${name}: could not reach the start state of "${action}" (states: ${states || "none"})`);
                }
                await browser.startTracing(tab, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"] });
                await tab.evaluate((root) => window.__scnx.arm(root), scenario.root);
                await tab.mouse.click(x, y);
                if (action === "reversed") {
                  await tab.waitForTimeout(60);
                  await tab.mouse.click(x, y);
                }
                const result = await tab.evaluate(() => window.__scnx.done);
                const events = JSON.parse((await browser.stopTracing()).toString()).traceEvents;
                samples.push({ forcedLayouts: forcedLayouts(events), animated: result.animated, longAnimationFrames: result.loaf });
                await context.close();
              }
              const forced = samples.map((s) => s.forcedLayouts);
              const limit = reducedMotion ? MAX_FORCED_REDUCED : MAX_FORCED_ANIMATED;
              const entry = { transition: name, reducedMotion, action, engine: `chromium ${browser.version()}`, forcedLayouts: forced, maxForcedLayouts: Math.max(...forced), claim: limit, animated: samples.every((s) => s.animated), longAnimationFrames: samples.flatMap((s) => s.longAnimationFrames) };
              report.transitions.push(entry);
              if (entry.maxForcedLayouts > limit) failures.push(`${name} ${action}${reducedMotion ? " (reduced motion)" : ""}: ${entry.maxForcedLayouts} forced layouts; TDD theme X3 claims at most ${limit}`);
              if (reducedMotion && entry.animated) failures.push(`${name} ${action} (reduced motion): a transition phase ran`);
            }
          }
        }
      }

      // Theme switch: Event Timing in every engine, forced layouts in Chromium.
      const durations = [];
      const forced = [];
      let supported = true;
      for (let run = 0; run < RUNS; run++) {
        const { context, tab } = await open(browser, false);
        const [x, y] = await center(tab, "#mode");
        const tracing = engine.name === "chromium";
        if (tracing) await browser.startTracing(tab, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"] });
        await tab.evaluate(() => window.__scnx.arm("#root"));
        await tab.mouse.click(x, y);
        await tab.evaluate(() => window.__scnx.done);
        await tab.waitForTimeout(100);
        const timing = await tab.evaluate(() => ({
          unsupported: !!window.__scnx.noEventTiming,
          click: window.__scnx.events.filter((e) => e.name === "click" || e.name === "pointerup" || e.name === "pointerdown").map((e) => e.duration),
        }));
        if (tracing) forced.push(forcedLayouts(JSON.parse((await browser.stopTracing()).toString()).traceEvents));
        if (timing.unsupported) supported = false;
        durations.push(timing.click.length > 0 ? Math.max(...timing.click) : null);
        await context.close();
      }
      const reported = durations.filter((d) => d !== null);
      report.themeSwitch.push({
        engine: `${engine.name} ${browser.version()}`,
        eventTiming: supported ? "supported" : "unsupported",
        durationsMs: durations,
        medianMs: reported.length > 0 ? median(reported) : null,
        note: reported.length < durations.length ? "a null sample reported no event of 16 ms or more" : undefined,
        ...(forced.length > 0 ? { forcedLayouts: forced } : {}),
      });
    } finally {
      await browser.close();
    }
  }
  if (report.transitions.length === 0) failures.push("no transition was traced (Chromium is not among the engines)");
} catch (error) {
  failures.push(`${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim());
} finally {
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

report.result = failures.length === 0 ? "pass" : "fail";
report.failures = failures;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "traces-report.json"), `${JSON.stringify(report, null, 2)}\n`);

const lines = [
  "### Interaction traces",
  "",
  `| Transition | Motion | Action | Forced layouts (${RUNS} runs) | Claim | Long frames |`,
  "| :-- | :-- | :-- | :-- | --: | --: |",
  ...report.transitions.map((t) => `| ${t.transition} | ${t.reducedMotion ? "reduced" : "normal"} | ${t.action} | ${t.forcedLayouts.join(", ")} | ≤ ${t.claim} | ${t.longAnimationFrames.length} |`),
  "",
  "| Theme switch | Event Timing | Durations (ms) | Median | Forced layouts |",
  "| :-- | :-- | :-- | --: | :-- |",
  ...report.themeSwitch.map((t) => `| ${t.engine} | ${t.eventTiming} | ${t.durationsMs.map((d) => d ?? "<16").join(", ")} | ${t.medianMs ?? "<16"} | ${t.forcedLayouts?.join(", ") ?? "n/a"} |`),
  "",
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
if (failures.length > 0) {
  console.error(`Interaction traces: FAILED\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
