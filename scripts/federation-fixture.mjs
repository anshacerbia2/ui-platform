#!/usr/bin/env node
// PLAN P0 row 9 federation evaluation fixture (ADR-GLB-FE-012; TDD packaging
// "Conditional federation evaluation", F1-F8). Module Federation stays
// `assess`: this fixture produces evidence and authorizes no adoption.
//
// One host and three remotes compile with @rspack/core and its built-in
// ModuleFederationPlugin (ADR-GLB-FE-011) against the packed tarballs. The
// share map comes from scripts/federation-share-map.mjs. remote_c declares an
// incompatible @scnx/core-ui range; remote_x points at a missing entry;
// remote_d bundles its own React, a negative control for the identity check.
// It fails unless, in Chromium:
// - in both load orders (remote_a then remote_b, and the reverse) every
//   participant holds the host's React internals and ThemeProvider module,
//   both remotes read the host's theme context, and their Accordions open;
// - exactly one component stylesheet is applied and no remote emits CSS;
// - every share negotiation emits a versioned event that selects the host's
//   version, and nothing logs a federation warning;
// - remote_c renders its route fallback, emits exactly one rejected event that
//   names both versions, and the host and remote_a keep working afterwards;
// - remote_x renders its route fallback;
// - remote_d, which does not share React, is reported as a split identity,
//   which proves the identity check detects a duplicate React;
// - no error escapes to the page.
//
//   node scripts/federation-fixture.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { packageOf, REACT_KEYS, shareKeys, shareMap } from "./federation-share-map.mjs";

// Pinned (TDD packaging F1, references [7], [8], [16]); bump deliberately, with a run of this fixture.
const RSPACK_VERSION = "2.2.8";
const MF_RUNTIME_VERSION = "2.9.2";
const EVENT_SCHEMA = "scnx.federation.share/1";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");
const coreUi = packReport.packages.find((pkg) => pkg.name === "@scnx/core-ui");
const reactRange = system.peerDependencies.react;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-federation-"));
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
};

// One install serves every application; each application's declared contract
// (name, version, peer ranges) is its own manifest.
const dependencies = {
  "@rspack/core": RSPACK_VERSION,
  "@module-federation/runtime-tools": MF_RUNTIME_VERSION,
  react: reactRange,
  "react-dom": reactRange,
};
for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
write("package.json", JSON.stringify({ name: "scnx-federation-fixture", private: true, type: "module", dependencies }, null, 2));

const contract = (coreUiRange) => ({
  react: reactRange,
  "react-dom": reactRange,
  "@scnx/core-ui": coreUiRange,
  "@scnx/system": `^${system.version}`,
});
const apps = [
  { name: "host", version: "1.4.0", role: "host", peerDependencies: contract(`^${coreUi.version}`) },
  { name: "remote_a", version: "2.1.0", role: "remote", peerDependencies: contract(`^${coreUi.version}`) },
  { name: "remote_b", version: "3.0.2", role: "remote", peerDependencies: contract(`^${coreUi.version}`) },
  // Incompatible: requires a major @scnx/core-ui the host does not offer.
  { name: "remote_c", version: "0.9.0", role: "remote", peerDependencies: contract(`^${Number(coreUi.version.split(".")[0]) + 1}.0.0`) },
  // Negative control: shares everything except React, so it bundles its own copy.
  { name: "remote_d", version: "1.0.0", role: "remote", peerDependencies: contract(`^${coreUi.version}`), ownReact: true },
];
const remoteUrls = {
  remote_a: "remote_a@/remote_a/remoteEntry.js",
  remote_b: "remote_b@/remote_b/remoteEntry.js",
  remote_c: "remote_c@/remote_c/remoteEntry.js",
  remote_d: "remote_d@/remote_d/remoteEntry.js",
  // Unavailable: nothing is served here.
  remote_x: "remote_x@/remote_x/remoteEntry.js",
};

// Runtime plugin (F6): wraps the share resolver of every participant and emits
// one versioned event per (participant, shared package, outcome).
write("telemetry-plugin.js", `const SCHEMA = ${JSON.stringify(EVENT_SCHEMA)};
const packageOf = ${packageOf.toString()};
export default function scnxShareTelemetry(options) {
  const g = globalThis;
  if (options.role === "host") g.__SCNX_HOST__ = { name: options.app, version: options.version };
  const seen = (g.__SCNX_FEDERATION_SEEN__ ??= new Set());
  const emit = (event) => {
    const key = [event.remote_name, event.shared_package, event.outcome, event.selected_version].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    (g.__SCNX_FEDERATION_EVENTS__ ??= []).push(event);
    g.dispatchEvent?.(new CustomEvent("scnx:federation", { detail: event }));
  };
  return {
    name: "scnx-share-telemetry",
    resolveShare(args) {
      const resolve = args.resolver;
      const base = () => ({
        schema: SCHEMA,
        host_version: g.__SCNX_HOST__?.version ?? null,
        remote_name: options.role === "remote" ? options.app : null,
        remote_version: options.role === "remote" ? options.version : null,
        shared_package: packageOf(args.pkgName),
        required_range: args.shareInfo?.shareConfig?.requiredVersion ?? null,
        offered_versions: Object.keys(args.shareScopeMap?.[args.scope]?.[args.pkgName] ?? {}),
        selected_version: args.version ?? null,
      });
      args.resolver = () => {
        try {
          const result = resolve();
          emit({ ...base(), outcome: "selected", reason: null });
          return result;
        } catch (error) {
          emit({ ...base(), outcome: "rejected", reason: String(error?.message ?? error) });
          throw error;
        }
      };
      return args;
    },
  };
}
`);

// Host: owns React, React DOM, the theme context, and the CSS (ADR-GLB-FE-012
// section 5 item 7). Remotes load lazily, each inside its own error boundary.
write("host/src/index.js", `import("./bootstrap.jsx");\n`);
// F3: a bundler provides a non-relative share key only when the build resolves
// an import of it (reference [12]), so the host references every key lazily.
// Nothing here executes until a consumer asks for the module.
write(
  "host/src/provides.js",
  `// Generated from the share map: one lazy reference per share key.\nexport const provides = {\n${shareKeys(packReport)
    .map((key) => `  ${JSON.stringify(key)}: () => import(${JSON.stringify(key)}),`)
    .join("\n")}\n};\n`,
);
write("host/src/bootstrap.jsx", `import "@scnx/system/styles/components.css";
import "@scnx/system/tokens/css/default.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import * as ThemeModule from "@scnx/core-ui/providers/theme-provider-base";
import { provides } from "./provides.js";

// \`react\` is CommonJS: each \`import * as\` gets its own interop namespace, so
// identity is compared on what React shares (hooks run through its internals).
const reactIdentity = (R) => ({ useState: R.useState, internals: R.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE });
(globalThis.__SCNX_IDENTITY__ ??= {}).host = { react: reactIdentity(React), ThemeModule, provides: Object.keys(provides).length };

const remotes = {
  remote_a: React.lazy(() => import("remote_a/Widget")),
  remote_b: React.lazy(() => import("remote_b/Widget")),
  remote_c: React.lazy(() => import("remote_c/Widget")),
  remote_d: React.lazy(() => import("remote_d/Widget")),
  remote_x: React.lazy(() => import("remote_x/Widget")),
};

class RouteBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) return <p role="alert" data-fallback={this.props.name}>{this.props.name} is unavailable.</p>;
    return this.props.children;
  }
}

function App() {
  const [routes, setRoutes] = React.useState([]);
  const [clicks, setClicks] = React.useState(0);
  return (
    <ThemeModule.ThemeProvider themeId="default" defaultMode="light" storage={false}>
      <main data-host="ready">
        <button type="button" data-host-counter={clicks} onClick={() => setClicks((n) => n + 1)}>Host clicks {clicks}</button>
        {Object.keys(remotes).map((name) => (
          <button key={name} type="button" data-open={name} onClick={() => setRoutes((open) => (open.includes(name) ? open : [...open, name]))}>Open {name}</button>
        ))}
        {routes.map((name) => {
          const Remote = remotes[name];
          return (
            <RouteBoundary key={name} name={name}>
              <React.Suspense fallback={<p data-loading={name}>Loading {name}</p>}>
                <Remote />
              </React.Suspense>
            </RouteBoundary>
          );
        })}
      </main>
    </ThemeModule.ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
`);

// Remotes: one widget source; each records the module objects it received.
for (const app of apps.filter((a) => a.role === "remote")) {
  write(`${app.name}/src/Widget.jsx`, `import * as React from "react";
import * as ThemeModule from "@scnx/core-ui/providers/theme-provider-base";
import { Accordion } from "@scnx/system/components/accordion";

(globalThis.__SCNX_IDENTITY__ ??= {})[${JSON.stringify(app.name)}] = {
  react: { useState: React.useState, internals: React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE },
  ThemeModule,
};

export default function Widget() {
  const theme = ThemeModule.useTheme();
  const [renders] = React.useState(1);
  return (
    <section data-remote=${JSON.stringify(app.name)} data-theme-id={theme.themeId} data-renders={renders}>
      <Accordion>
        <Accordion.Item value="details">
          <Accordion.Trigger data-remote-trigger=${JSON.stringify(app.name)}>${app.name} details</Accordion.Trigger>
          <Accordion.Content>${app.name} body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </section>
  );
}
`);
}

const installedVersion = (pkg) => JSON.parse(fs.readFileSync(path.join(dir, "node_modules", pkg, "package.json"), "utf8")).version;

const report = { schemaVersion: 1, rspack: RSPACK_VERSION, mfRuntime: MF_RUNTIME_VERSION, scenarios: [] };
let failed = false;
let server;
const browser = await chromium.launch();
try {
  execSync(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  report.versions = Object.fromEntries(["@rspack/core", "@module-federation/runtime-tools", "react", "react-dom", "@scnx/core-ui", "@scnx/system"].map((pkg) => [pkg, installedVersion(pkg)]));

  // F1: one Rspack configuration per application, built through the JS API.
  const configs = apps.map((app) => ({
    name: app.name,
    role: app.role,
    shared: Object.fromEntries(
      Object.entries(shareMap({ role: app.role, manifest: app, packReport, installedVersion })).filter(([key]) => !(app.ownReact && REACT_KEYS.includes(key))),
    ),
    runtimePlugin: [path.join(dir, "telemetry-plugin.js"), { app: app.name, version: app.version, role: app.role }],
  }));
  write("build.mjs", `import { rspack } from "@rspack/core";
import path from "node:path";
const apps = ${JSON.stringify(configs, null, 2)};
const remotes = ${JSON.stringify(remoteUrls)};
const dir = ${JSON.stringify(dir)};
const compilers = apps.map((app) => {
  const isHost = app.role === "host";
  return {
    name: app.name,
    mode: "production",
    context: path.join(dir, app.name),
    entry: isHost ? "./src/index.js" : {},
    output: { path: path.join(dir, "dist", app.name), publicPath: "/" + app.name + "/", uniqueName: app.name, clean: true },
    resolve: { extensions: [".js", ".jsx"] },
    module: {
      rules: [
        {
          test: /\\.jsx?$/,
          exclude: /node_modules/,
          loader: "builtin:swc-loader",
          options: { jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } } },
          type: "javascript/auto",
        },
        // Native CSS: only the host imports UI CSS (ADR-GLB-FE-012 section 5 item 7).
        { test: /\\.css$/, type: "css" },
        { test: /\\.woff2$/, type: "asset/resource" },
      ],
    },
    plugins: [
      new rspack.container.ModuleFederationPlugin({
        name: app.name,
        filename: "remoteEntry.js",
        exposes: isHost ? undefined : { "./Widget": "./src/Widget.jsx" },
        remotes: isHost ? remotes : undefined,
        shared: app.shared,
        shareStrategy: "loaded-first",
        runtimePlugins: [app.runtimePlugin],
      }),
      ...(isHost
        ? [new rspack.HtmlRspackPlugin({ templateContent: '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Federation fixture</title></head><body><div id="root"></div></body></html>' })]
        : []),
    ],
  };
});
rspack(compilers).run((error, stats) => {
  if (error) throw error;
  const info = stats.toJson({ all: false, errors: true, warnings: true });
  if (stats.hasErrors() || info.warnings?.length) {
    console.error(JSON.stringify({ errors: info.errors?.map((e) => e.message), warnings: info.warnings?.map((w) => w.message) }, null, 2));
    process.exit(1);
  }
});
`);
  execSync("node build.mjs", { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  report.scenarios.push({ scenario: "build", result: "pass", applications: apps.map((a) => a.name) });

  // F7: remotes ship no stylesheet.
  for (const app of apps.filter((a) => a.role === "remote")) {
    const css = fs.readdirSync(path.join(dir, "dist", app.name), { recursive: true }).filter((file) => String(file).endsWith(".css"));
    if (css.length > 0) throw new Error(`${app.name} emits CSS: ${css.join(", ")}`);
  }

  const distRoot = path.join(dir, "dist");
  server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost").pathname;
    const file = url === "/" ? path.join(distRoot, "host", "index.html") : path.join(distRoot, url);
    if (!file.startsWith(distRoot) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end();
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".css") ? "text/css" : "text/javascript";
    response.writeHead(200, { "content-type": type }).end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const visit = async () => {
    const page = await browser.newPage();
    const log = { pageErrors: [], errors: [], warnings: [] };
    page.on("pageerror", (error) => log.pageErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") log.errors.push(message.text());
      if (message.type() === "warning") log.warnings.push(message.text());
    });
    await page.goto(origin);
    await page.waitForSelector("[data-host='ready']");
    return { page, log };
  };
  const open = (page, name) => page.click(`[data-open='${name}']`);
  const events = (page) => page.evaluate(() => globalThis.__SCNX_FEDERATION_EVENTS__ ?? []);
  const hostVersion = apps.find((a) => a.role === "host").version;

  // F5: both load orders keep one identity and one stylesheet.
  for (const order of [["remote_a", "remote_b"], ["remote_b", "remote_a"]]) {
    const { page, log } = await visit();
    for (const name of order) {
      await open(page, name);
      await page.waitForSelector(`[data-remote='${name}'][data-theme-id='default']`);
    }
    const identity = await page.evaluate((names) => {
      const all = globalThis.__SCNX_IDENTITY__;
      const host = all.host;
      return names.map((name) => ({
        name,
        react: Boolean(host.react.internals) && all[name]?.react.internals === host.react.internals && all[name]?.react.useState === host.react.useState,
        theme: all[name]?.ThemeModule === host.ThemeModule,
      }));
    }, order);
    const split = identity.filter((entry) => !entry.react || !entry.theme);
    if (split.length > 0) throw new Error(`Order ${order.join(" -> ")}: split identity ${JSON.stringify(split)}`);
    for (const name of order) {
      await page.click(`[data-remote-trigger='${name}']`);
      await page.waitForFunction((n) => document.querySelector(`[data-remote-trigger='${n}']`)?.getAttribute("aria-expanded") === "true", name);
    }
    const sheets = await page.evaluate(() => {
      const hasComponentRule = (rules) =>
        [...rules].some((rule) => (rule.selectorText ?? "").includes(".scnx-accordion") || (rule.cssRules && hasComponentRule(rule.cssRules)));
      return [...document.styleSheets].filter((sheet) => hasComponentRule(sheet.cssRules)).length;
    });
    if (sheets !== 1) throw new Error(`Order ${order.join(" -> ")}: ${sheets} component stylesheets applied; expected 1`);
    const negotiated = await events(page);
    const wrong = negotiated.filter((e) => e.schema !== EVENT_SCHEMA || e.outcome !== "selected" || e.host_version !== hostVersion);
    if (wrong.length > 0) throw new Error(`Order ${order.join(" -> ")}: unexpected share events ${JSON.stringify(wrong, null, 2)}`);
    for (const name of order) {
      const packages = new Set(negotiated.filter((e) => e.remote_name === name).map((e) => e.shared_package));
      for (const pkg of ["react", "@scnx/core-ui", "@scnx/system"]) {
        if (!packages.has(pkg)) throw new Error(`Order ${order.join(" -> ")}: no ${pkg} share event from ${name}`);
      }
    }
    const federationWarnings = log.warnings.filter((text) => /federation|shared singleton/i.test(text));
    if (log.pageErrors.length + log.errors.length + federationWarnings.length > 0) {
      throw new Error(`Order ${order.join(" -> ")}: ${JSON.stringify({ ...log, warnings: federationWarnings })}`);
    }
    report.scenarios.push({ scenario: `order ${order.join(" -> ")}`, result: "pass", identity, componentStylesheets: sheets, events: negotiated.length });
    await page.close();
  }

  // F6/F8: an incompatible remote and an unavailable remote fail route-locally.
  {
    const { page, log } = await visit();
    await open(page, "remote_c");
    await page.waitForSelector("[data-fallback='remote_c']");
    const rejected = (await events(page)).filter((e) => e.outcome === "rejected");
    const expected = {
      schema: EVENT_SCHEMA,
      host_version: hostVersion,
      remote_name: "remote_c",
      remote_version: "0.9.0",
      shared_package: "@scnx/core-ui",
      required_range: apps.find((a) => a.name === "remote_c").peerDependencies["@scnx/core-ui"],
      selected_version: coreUi.version,
      outcome: "rejected",
    };
    const matches = rejected.length === 1 && Object.entries(expected).every(([key, value]) => rejected[0][key] === value) && rejected[0].offered_versions.includes(coreUi.version);
    if (!matches) throw new Error(`remote_c: expected one rejected event ${JSON.stringify(expected)}, got ${JSON.stringify(rejected, null, 2)}`);
    await page.click("[data-host-counter]");
    await page.waitForSelector("[data-host-counter='1']");
    await open(page, "remote_a");
    await page.waitForSelector("[data-remote='remote_a'][data-theme-id='default']");
    await open(page, "remote_x");
    await page.waitForSelector("[data-fallback='remote_x']");
    await page.click("[data-remote-trigger='remote_a']");
    await page.waitForFunction(() => document.querySelector("[data-remote-trigger='remote_a']")?.getAttribute("aria-expanded") === "true");
    await open(page, "remote_d");
    await page.waitForSelector("[data-remote='remote_d'], [data-fallback='remote_d']");
    const control = await page.evaluate(() => {
      const all = globalThis.__SCNX_IDENTITY__;
      return { recorded: Boolean(all.remote_d), sameReact: all.remote_d?.react.internals === all.host.react.internals };
    });
    if (!control.recorded || control.sameReact) throw new Error(`remote_d bundles its own React, but the identity check did not report it: ${JSON.stringify(control)}`);
    if (log.pageErrors.length > 0) throw new Error(`Failure scenario: errors escaped to the page ${JSON.stringify(log.pageErrors)}`);
    const remoteD = (await page.locator("[data-fallback='remote_d']").count()) > 0 ? "fallback" : "rendered";
    report.scenarios.push({ scenario: "incompatible and unavailable remotes", result: "pass", rejectedEvent: rejected[0], consoleErrors: log.errors.length, duplicateReactControl: { detected: true, remoteD } });
    await page.close();
  }

  report.result = "pass";
  console.log(
    `Federation fixture passed (Rspack ${report.versions["@rspack/core"]}, MF runtime ${report.versions["@module-federation/runtime-tools"]}): both load orders keep one React and theme identity with one stylesheet; remote_c fails route-locally with one rejected event; remote_x falls back; the host stays usable; a duplicate React is detected`,
  );
} catch (error) {
  failed = true;
  report.result = "fail";
  report.error = `${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
  console.error(`Federation fixture: FAILED\n${report.error}`);
} finally {
  await browser.close();
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "federation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failed) process.exit(1);
