#!/usr/bin/env node
// PLAN P0 row 8 Next.js App Router fixture (TDD packaging K5). Installs the
// packed tarballs and a pinned Next.js into a fresh project, renders every
// server-safe entry and every client-only entry from a Server Component page
// (client entries whose parts are static properties, or whose props are
// functions, render inside one client island), runs `next build` and
// `next start`, and fails unless, in Chromium:
// - the server HTML contains every server-safe entry's markup;
// - the page hydrates with zero console errors and zero page errors;
// - an Accordion trigger opens its panel (one working client interaction);
// - a negative page that renders different text on the server and the client
//   reports a hydration error, which proves hydration errors are detected.
//
//   node scripts/nextjs-consumer.mjs --packs <dir from inspect-packages.mjs> [--out <report dir>]

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

// Pinned (TDD packaging K5, reference [5]); bump deliberately, with a run of this fixture.
const NEXT_VERSION = "16.3.8";

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const packsDir = path.resolve(arg("--packs", "artifacts/packages"));
const outDir = path.resolve(arg("--out", packsDir));
const packReport = JSON.parse(fs.readFileSync(path.join(packsDir, "pack-report.json"), "utf8"));
const system = packReport.packages.find((pkg) => pkg.name === "@scnx/system");

const specifiers = { "server-safe": [], "client-only": [] };
for (const pkg of packReport.packages) {
  for (const [subpath, environment] of Object.entries(pkg.environments)) specifiers[environment].push(`${pkg.name}${subpath.slice(1)}`);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scnx-nextjs-"));
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
};
const dependencies = { next: NEXT_VERSION, react: system.peerDependencies.react, "react-dom": system.peerDependencies["react-dom"] };
for (const pkg of packReport.packages) dependencies[pkg.name] = `file:${path.join(packsDir, pkg.tarball).replaceAll("\\", "/")}`;
write("package.json", JSON.stringify({ name: "scnx-nextjs-consumer", private: true, type: "module", dependencies }, null, 2));
write("next.config.mjs", "export default {};\n");
// An app icon keeps the browser's default /favicon.ico request from logging a 404.
write("app/icon.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>\n');

write("app/layout.jsx", `import "@scnx/system/styles/components.css";
import "@scnx/system/tokens/css/default.css";
import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider themeId="default" defaultMode="light">{children}</ThemeProvider>
      </body>
    </html>
  );
}
`);

// Server-safe entries: every component export renders here, in a Server
// Component, the way the K4 fixture renders them with react-dom/server.
const namespaces = specifiers["server-safe"].map((specifier, index) => ({ specifier, name: `ns${index}` }));
write("app/page.jsx", `${namespaces.map(({ specifier, name }) => `import * as ${name} from "${specifier}";`).join("\n")}
import { NavigationBase, NavigationBaseGroup, NavigationBaseItem, NavigationBaseRoot } from "@scnx/core-ui/components/navigation-base";
import { TableOfContentsBaseItem, TableOfContentsBaseLink, TableOfContentsBaseList, TableOfContentsBaseRoot } from "@scnx/core-ui/components/table-of-contents-base";
import { TransitionBase } from "@scnx/core-ui/components/transition-base";
import { Text as BarrelText } from "@scnx/system/components";
import { NavigationGroup, NavigationItem, NavigationRoot } from "@scnx/system/components/navigation";
import { TableOfContents } from "@scnx/system/components/table-of-contents";
import { Transition } from "@scnx/system/components/transition";
import { Island } from "./island";

const isComponent = (value) =>
  typeof value === "function" || (typeof value === "object" && value !== null && typeof value.$$typeof === "symbol");
const serverSafe = [${namespaces.map(({ specifier, name }) => `["${specifier}", ${name}]`).join(", ")}];

export default function Page() {
  return (
    <main>
      {serverSafe.map(([specifier, mod]) => (
        <section key={specifier} data-entry={specifier}>
          {Object.entries(mod)
            .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
            .map(([name, Component]) => <Component key={name}>{"server-safe " + specifier + " " + name}</Component>)}
        </section>
      ))}
      {/* Client-only entries with serializable props, from the Server Component. */}
      <NavigationBaseRoot aria-label="Base navigation">
        <NavigationBaseGroup>
          <NavigationBaseItem href="#people" label="People" isActive />
        </NavigationBaseGroup>
      </NavigationBaseRoot>
      <h2 id="overview">Overview</h2>
      <TableOfContentsBaseRoot items={[{ id: "overview", title: "Overview" }]} aria-label="Base contents">
        <TableOfContentsBaseList>
          <TableOfContentsBaseItem>
            <TableOfContentsBaseLink targetId="overview">Overview</TableOfContentsBaseLink>
          </TableOfContentsBaseItem>
        </TableOfContentsBaseList>
      </TableOfContentsBaseRoot>
      <TransitionBase open>
        <p>Base transition</p>
      </TransitionBase>
      <BarrelText>From the aggregate entry</BarrelText>
      <NavigationRoot aria-label="Styled navigation">
        <NavigationGroup>
          <NavigationItem href="#teams" label="Teams" />
        </NavigationGroup>
      </NavigationRoot>
      <TableOfContents items={[{ id: "overview", title: "Overview", url: "#overview" }]} initialActiveId="overview" />
      <Transition open styleFrom={{ opacity: 0 }} styleTo={{ opacity: 1 }}>
        <p>Styled transition</p>
      </Transition>
      <Island />
    </main>
  );
}
`);

// Client island: compound parts reached as static properties (a Server
// Component cannot dot into a client module) and function props.
write("app/island.jsx", `"use client";
import { useEffect, useRef, useState } from "react";
import { AccordionBase } from "@scnx/core-ui/components/accordion-base";
import { CodeShowcaseBase } from "@scnx/core-ui/components/code-showcase-base";
import { CollapsibleBase } from "@scnx/core-ui/components/collapsible-base";
import { useDisclosureItem } from "@scnx/core-ui/components/disclosure-base";
import { EdgeLayoutBase } from "@scnx/core-ui/components/edge-layout-base";
import { NavigationBarBase } from "@scnx/core-ui/components/navigation-bar-base";
import { useOnClickOutside } from "@scnx/core-ui/hooks/use-on-click-outside";
import { useTheme } from "@scnx/core-ui/providers/theme-provider-base";
import { Accordion } from "@scnx/system/components/accordion";
import { CodeSelect } from "@scnx/system/components/code-select";
import { CodeShowcase } from "@scnx/system/components/code-showcase";
import { EdgeLayout } from "@scnx/system/components/edge-layout";
import { FloatingLayout } from "@scnx/system/components/floating-layout";
import { Sidebar, SidebarProvider } from "@scnx/system/components/sidebar";

const ItemState = () => <span>{useDisclosureItem().open ? "open" : "closed"}</span>;

const Nav = () => (
  <Sidebar>
    <Sidebar.Nav aria-label="Main">
      <Sidebar.Nav.Group>
        <Sidebar.Nav.Item href="#people" label="People" />
      </Sidebar.Nav.Group>
    </Sidebar.Nav>
  </Sidebar>
);

export function Island() {
  const theme = useTheme();
  const [hydrated, setHydrated] = useState(false);
  const [language, setLanguage] = useState("tsx");
  const [outside, setOutside] = useState(0);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOutside((count) => count + 1));
  useEffect(() => setHydrated(true), []);
  return (
    <div ref={ref} data-island={hydrated ? "hydrated" : "server"} data-theme-id={theme.themeId} data-outside={outside}>
      <Accordion>
        <Accordion.Item value="leave">
          <Accordion.Trigger data-fixture="accordion-trigger">Leave policy</Accordion.Trigger>
          <Accordion.Content>Annual leave accrues monthly.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <AccordionBase>
        <AccordionBase.Item value="base">
          <AccordionBase.Header>
            <AccordionBase.Trigger>Base section</AccordionBase.Trigger>
          </AccordionBase.Header>
          <AccordionBase.Content>Base body</AccordionBase.Content>
        </AccordionBase.Item>
      </AccordionBase>
      <CollapsibleBase>
        <CollapsibleBase.Item>
          <CollapsibleBase.Trigger>Details <ItemState /></CollapsibleBase.Trigger>
          <CollapsibleBase.Content>Shown</CollapsibleBase.Content>
        </CollapsibleBase.Item>
      </CollapsibleBase>
      <CodeShowcaseBase>
        <CodeShowcaseBase.Preview>Base preview</CodeShowcaseBase.Preview>
        <CodeShowcaseBase.Nav>
          <CodeShowcaseBase.Trigger>Show base code</CodeShowcaseBase.Trigger>
        </CodeShowcaseBase.Nav>
        <CodeShowcaseBase.Content>
          <pre><code>{"<Base />"}</code></pre>
        </CodeShowcaseBase.Content>
      </CodeShowcaseBase>
      <CodeShowcase>
        <CodeShowcase.Preview>Preview</CodeShowcase.Preview>
        <CodeShowcase.Nav>
          <CodeShowcase.Trigger>Show code</CodeShowcase.Trigger>
        </CodeShowcase.Nav>
        <CodeShowcase.Content>
          <pre><code>{"<Preview />"}</code></pre>
        </CodeShowcase.Content>
      </CodeShowcase>
      <CodeSelect
        options={[{ id: "tsx", title: "TypeScript (TSX)" }, { id: "css", title: "CSS" }]}
        value={language}
        onChange={setLanguage}
        placeholder="Language"
      />
      <NavigationBarBase.Root>
        <NavigationBarBase.Start>Brand</NavigationBarBase.Start>
        <NavigationBarBase.End>Account</NavigationBarBase.End>
      </NavigationBarBase.Root>
      <EdgeLayoutBase>
        <EdgeLayoutBase.Content>Base layout content</EdgeLayoutBase.Content>
      </EdgeLayoutBase>
      <SidebarProvider activePath="#people">
        <EdgeLayout>
          <EdgeLayout.Navbar>
            <EdgeLayout.Navbar.Start>Scnehaux</EdgeLayout.Navbar.Start>
          </EdgeLayout.Navbar>
          <EdgeLayout.Sidebar><Nav /></EdgeLayout.Sidebar>
          <EdgeLayout.Content>Edge layout content</EdgeLayout.Content>
        </EdgeLayout>
      </SidebarProvider>
      <SidebarProvider activePath="#people">
        <FloatingLayout>
          <FloatingLayout.Sidebar><Nav /></FloatingLayout.Sidebar>
          <FloatingLayout.Content>Floating layout content</FloatingLayout.Content>
        </FloatingLayout>
      </SidebarProvider>
    </div>
  );
}
`);

// Negative control: text that differs between the server and the client.
write("app/negative/page.jsx", `import { Mismatch } from "./mismatch";
export default function Negative() {
  return <main><Mismatch /></main>;
}
`);
write("app/negative/mismatch.jsx", `"use client";
export function Mismatch() {
  return <p>{typeof window === "undefined" ? "server" : "client"}</p>;
}
`);

// Every client-only entry is imported by the page, the layout, or the island.
const sources = ["app/layout.jsx", "app/page.jsx", "app/island.jsx"].map((file) => fs.readFileSync(path.join(dir, file), "utf8")).join("\n");
const unrendered = specifiers["client-only"].filter((specifier) => !sources.includes(`from "${specifier}"`));
if (unrendered.length > 0) throw new Error(`Client-only entries missing from the fixture: ${unrendered.join(", ")}`);

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
const run = (command) => execSync(command, { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
const report = { schemaVersion: 1, next: NEXT_VERSION, checks: [] };
let failed = false;
let server;
const browser = await chromium.launch();
try {
  run(`pnpm install --ignore-workspace --strict-peer-dependencies --store-dir ${JSON.stringify(path.join(dir, ".store"))}`);
  report.versions = Object.fromEntries(
    ["next", "react", "react-dom", ...packReport.packages.map((pkg) => pkg.name)].map((name) => [
      name,
      JSON.parse(fs.readFileSync(path.join(dir, "node_modules", name, "package.json"), "utf8")).version,
    ]),
  );
  run("node node_modules/next/dist/bin/next build");
  report.checks.push({ check: "next-build", result: "pass" });

  const port = await new Promise((resolve) => {
    const probe = net.createServer().listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], { cwd: dir, env, stdio: "ignore" });
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      if ((await fetch(origin)).ok) break;
    } catch {}
    if (Date.now() > deadline) throw new Error("next start did not answer within 30 s");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const html = await (await fetch(origin)).text();
  const missing = specifiers["server-safe"].filter((specifier) => !html.includes(`data-entry="${specifier}"`) || !html.includes(`server-safe ${specifier} `));
  if (missing.length > 0) throw new Error(`Server HTML lacks server-safe entries: ${missing.join(", ")}`);
  report.checks.push({ check: "server-html", result: "pass", entries: specifiers["server-safe"].length });

  const visit = async (url) => {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", (message) => message.type() === "error" && errors.push(`${message.text()} (${message.location().url})`));
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("response", (response) => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));
    await page.goto(url);
    return { page, errors };
  };

  const { page, errors } = await visit(origin);
  await page.waitForSelector("[data-island='hydrated']");
  const trigger = page.locator("[data-fixture='accordion-trigger']");
  await trigger.click();
  await page.waitForFunction(() => document.querySelector("[data-fixture='accordion-trigger']")?.getAttribute("aria-expanded") === "true");
  if (!(await page.getByText("Annual leave accrues monthly.").isVisible())) throw new Error("Accordion panel is not visible after its trigger was clicked");
  await page.waitForTimeout(500);
  if (errors.length > 0) throw new Error(`Console or page errors on the fixture page:\n${errors.join("\n")}`);
  report.checks.push({ check: "hydration-and-interaction", result: "pass", clientEntries: specifiers["client-only"].length });

  const negative = await visit(`${origin}/negative`);
  await negative.page.waitForTimeout(1000);
  // Production React reports minified codes; 418 and 421-424 are its
  // hydration failures (facebook/react scripts/error-codes/codes.json).
  if (!negative.errors.some((text) => /hydrat|react\.dev\/errors\/(418|42[1-4])\b/i.test(text))) {
    throw new Error(`The mismatch page reported no hydration error; detection does not work:\n${negative.errors.join("\n")}`);
  }
  report.checks.push({ check: "hydration-error-detected", result: "pass" });
  report.result = "pass";
  console.log(
    `Next.js ${report.versions.next} App Router: build and start pass, ${specifiers["server-safe"].length} server-safe and ${specifiers["client-only"].length} client-only entries render, hydration has zero errors, Accordion opens; a mismatch page is detected`,
  );
} catch (error) {
  failed = true;
  report.result = "fail";
  report.error = `${error.message}\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
  console.error(`Next.js consumer: FAILED\n${report.error}`);
} finally {
  await browser.close();
  server?.kill();
  fs.rmSync(dir, { recursive: true, force: true });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "nextjs-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failed) process.exit(1);
