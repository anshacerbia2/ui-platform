// TDD packaging RC5: the browser engines every packed browser fixture runs in,
// from support-matrix.json. SCNX_BROWSERS (comma-separated) narrows the list
// on a host that lacks an engine's system dependencies; CI never narrows it.

import fs from "node:fs";
import { chromium, firefox, webkit } from "playwright";

const TYPES = { chromium, firefox, webkit };

/** The engines to run, as `{ name, type }` with the Playwright browser type. */
export function browserEngines() {
  const declared = JSON.parse(fs.readFileSync("support-matrix.json", "utf8")).browsers;
  const narrowed = process.env.SCNX_BROWSERS?.split(",").map((name) => name.trim()).filter(Boolean);
  if (narrowed && process.env.CI) throw new Error("SCNX_BROWSERS narrows the browser engines and is not allowed in CI");
  const names = narrowed ?? declared;
  for (const name of names) {
    if (!declared.includes(name) || !TYPES[name]) throw new Error(`Browser engine "${name}" is not in support-matrix.json (${declared.join(", ")})`);
  }
  return names.map((name) => ({ name, type: TYPES[name] }));
}
