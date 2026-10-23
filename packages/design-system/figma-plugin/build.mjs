#!/usr/bin/env node
// Builds the Figma plugin from the package's emitted tokens (TDD tokens FG7-FG11; usage: TDD tokens, Operational Notes):
// dist/code.js is the plan (scripts/figma/plan.mjs) followed by runtime.js.
//
//   node figma-plugin/build.mjs        (after `pnpm build` of @scnx/system)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPlan } from "../scripts/figma/plan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const plan = buildPlan(path.join(here, "../dist"));
const out = path.join(here, "dist");
fs.mkdirSync(out, { recursive: true });
const runtime = fs.readFileSync(path.join(here, "runtime.js"), "utf8");
fs.writeFileSync(path.join(out, "code.js"), `const PLAN = ${JSON.stringify(plan)};\n${runtime}`);
fs.copyFileSync(path.join(here, "ui.html"), path.join(out, "ui.html"));
console.log(`figma-plugin/dist: ${plan.source}, ${plan.collections.map((c) => `${c.variables.length} × ${c.modes.length}`).join(" + ")} variables, ${plan.textStyles.length} text styles, ${plan.effectStyles.length} effect styles`);
