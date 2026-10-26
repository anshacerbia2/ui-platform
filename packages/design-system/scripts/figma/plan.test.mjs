// @vitest-environment node
// The Figma library plan and plugin (TDD tokens FG7-FG11), on the token source: the plan
// is built from freshly emitted outputs, and the built plugin runs against a Plugin API
// double that enforces a mode limit, so creation, idempotency, and the limit are tested.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { emit } from "../tokens/emit.mjs";
import { COLOR_COLLECTION, DIMENSION_COLLECTION, buildPlan, scopesFor, shadowLayer } from "./plan.mjs";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
let plan;
beforeAll(() => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "figma-plan-"));
  emit({ packageDir, outDir: dist });
  plan = buildPlan(dist, { source: "@scnx/system@test" });
});

describe("Figma plan (FG7-FG10)", () => {
  it("puts every theme and mode into one Color collection and every theme into one Dimension collection", () => {
    const [color, dimension] = plan.collections;
    expect(color.name).toBe(COLOR_COLLECTION);
    expect(color.modes).toEqual(["Light", "Dark", "scnx-saas light", "scnx-saas dark"]);
    expect(dimension.name).toBe(DIMENSION_COLLECTION);
    expect(dimension.modes).toEqual(["scnx-platform", "scnx-saas"]);
    for (const c of plan.collections) for (const v of c.variables) expect(v.values).toHaveLength(c.modes.length);
    expect(new Set(color.variables.map((v) => v.name)).size).toBe(color.variables.length);
  });

  it("names variables by canonical path and carries the CSS custom property as code syntax", () => {
    const canvas = plan.collections[0].variables.find((v) => v.name === "color/neutral/surface/canvas/default");
    expect(canvas.codeSyntax.WEB).toBe("var(--ds-color-neutral-surface-canvas-default)");
    expect(canvas.type).toBe("COLOR");
    for (const value of canvas.values) for (const channel of ["r", "g", "b", "a"]) expect(value[channel]).toBeGreaterThanOrEqual(0);
  });

  it("scopes by the Tier-2 grammar, never by words in a name (ADR-UIP-TKN-004 item 4.3)", () => {
    expect(scopesFor("color.primary.surface.solid.default")).toEqual(["FRAME_FILL", "SHAPE_FILL"]);
    expect(scopesFor("color.neutral.icon.subtle.default")).toEqual(["SHAPE_FILL", "STROKE_COLOR"]);
    expect(scopesFor("color.neutral.shadow.default.default")).toEqual(["EFFECT_COLOR"]);
    expect(scopesFor("dimension.border-width.default")).toEqual(["STROKE_FLOAT"]);
    expect(scopesFor("dimension.z-index.modal")).toEqual([]);
    expect(() => scopesFor("color.neutral.glow.default.default")).toThrow("no Figma scope rule");
    for (const c of plan.collections) for (const v of c.variables) expect(v.scopes).not.toContain("ALL_SCOPES");
  });

  it("makes a text style per typography composite with Figma font names", () => {
    const names = plan.textStyles.map((s) => s.name);
    expect(names).toContain("heading/xlarge");
    expect(names).toContain("label/small");
    const heading = plan.textStyles.find((s) => s.name === "heading/xlarge");
    expect(heading).toMatchObject({ fontFamily: "Inter", fontStyle: "Bold", fontSize: 40, lineHeight: { unit: "PERCENT", value: 125 }, letterSpacing: { unit: "PERCENT", value: -2 } });
    const code = plan.textStyles.find((s) => s.name === "code/default");
    expect(code.fontFamily).toBe("Roboto Mono");
    expect(code.description).toContain("Figma substitute");
  });

  it("makes effect styles per theme whose colors are bound to color variables", () => {
    const names = new Set(plan.collections[0].variables.map((v) => v.name));
    expect(plan.effectStyles.map((s) => s.name)).toContain("scnx-platform/shadow/low");
    for (const style of plan.effectStyles) for (const e of style.effects) expect(names.has(e.colorVariable)).toBe(true);
    const focus = plan.effectStyles.find((s) => s.name === "scnx-platform/shadow/focus");
    expect(focus.effects[0].type).toBe("INNER_SHADOW");
    // A token whose layers differ by mode (the dark lit edge, TDD SI4) gets a style per mode.
    const styleNames = plan.effectStyles.map((s) => s.name);
    expect(styleNames).toEqual(expect.arrayContaining(["scnx-platform/material/raised", "scnx-platform/Light/material/menu", "scnx-platform/Dark/material/menu"]));
    expect(styleNames).not.toContain("scnx-platform/material/menu");
    expect(plan.effectStyles.find((s) => s.name === "scnx-platform/Dark/material/menu").effects[0]).toMatchObject({ type: "INNER_SHADOW", offset: { x: 0, y: 1 }, colorVariable: "color/neutral/border/default/default" });
    expect(plan.effectStyles.find((s) => s.name === "scnx-platform/Light/material/menu").effects.every((e) => e.type === "DROP_SHADOW")).toBe(true);
    const colors = new Map([["--ds-c", { name: "color/c", values: [{ r: 0, g: 0, b: 0, a: 1 }] }]]);
    expect(shadowLayer("0 4px 6px -1px var(--ds-c)", colors)).toMatchObject({ type: "DROP_SHADOW", offset: { x: 0, y: 4 }, radius: 6, spread: -1, colorVariable: "color/c" });
    expect(() => shadowLayer("0 4px 6px red", colors)).toThrow("unsupported shadow layer");
  });
});

/** A Plugin API double: variables, modes (limited), text and effect styles, the UI channel. */
function pluginDouble({ modeLimit }) {
  let id = 0;
  const next = (p) => `${p}:${++id}`;
  const collections = [];
  const variables = [];
  const textStyles = [];
  const effectStyles = [];
  const messages = [];
  const collection = (name) => {
    const c = {
      id: next("C"),
      name,
      modes: [{ modeId: next("M"), name: "Mode 1" }],
      renameMode(modeId, newName) { this.modes.find((m) => m.modeId === modeId).name = newName; },
      addMode(modeName) {
        if (this.modes.length >= modeLimit) throw new Error(`in addMode: Limited to ${modeLimit} modes only`);
        const modeId = next("M");
        this.modes.push({ modeId, name: modeName });
        return modeId;
      },
    };
    collections.push(c);
    return c;
  };
  const figma = {
    variables: {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...variables],
      createVariableCollection: collection,
      createVariable(name, c, resolvedType) {
        const v = { id: next("V"), name, variableCollectionId: c.id, resolvedType, valuesByMode: {}, codeSyntax: {}, scopes: ["ALL_SCOPES"], description: "",
          setValueForMode(modeId, value) { this.valuesByMode[modeId] = value; },
          setVariableCodeSyntax(platform, value) { this.codeSyntax[platform] = value; } };
        variables.push(v);
        return v;
      },
      setBoundVariableForEffect: (effect, field, variable) => ({ ...effect, boundVariables: { [field]: { type: "VARIABLE_ALIAS", id: variable.id } } }),
    },
    getLocalTextStylesAsync: async () => [...textStyles],
    getLocalEffectStylesAsync: async () => [...effectStyles],
    loadFontAsync: async () => {},
    createTextStyle: () => { const s = { id: next("T") }; textStyles.push(s); return s; },
    createEffectStyle: () => { const s = { id: next("E") }; effectStyles.push(s); return s; },
    showUI: () => {},
    ui: { postMessage: (m) => messages.push(m), onmessage: null },
  };
  return { figma, collections, variables, textStyles, effectStyles, messages };
}

async function runPlugin(code, double, apply = "all") {
  vm.runInNewContext(code, { figma: double.figma, __html__: "", console });
  // FG12: the plugin offers its choices first, then applies the one the reader makes.
  const offer = double.messages.shift();
  if (!offer?.choices) throw new Error("the plugin did not offer its choices");
  double.figma.ui.onmessage({ apply });
  for (let i = 0; i < 200 && double.messages.length === 0; i++) await new Promise((r) => setTimeout(r, 5));
  return double.messages.at(-1);
}

describe("Figma plugin (FG11)", () => {
  const runtime = fs.readFileSync(path.join(packageDir, "figma-plugin/runtime.js"), "utf8");
  const code = () => `const PLAN = ${JSON.stringify(plan)};\n${runtime}`;

  it("creates every variable, mode, and style, binds effect colors, and is idempotent", async () => {
    const double = pluginDouble({ modeLimit: 10 });
    const first = await runPlugin(code(), double);
    expect(first.errors).toEqual([]);
    expect(first.modesSkipped).toEqual([]);
    const total = plan.collections.reduce((n, c) => n + c.variables.length, 0);
    expect(first.variablesCreated).toBe(total);
    expect(double.collections.map((c) => c.modes.map((m) => m.name))).toEqual(plan.collections.map((c) => c.modes));
    const canvas = double.variables.find((v) => v.name === "color/neutral/surface/canvas/default");
    expect(Object.keys(canvas.valuesByMode)).toHaveLength(4);
    expect(canvas.codeSyntax.WEB).toBe("var(--ds-color-neutral-surface-canvas-default)");
    expect(canvas.scopes).toEqual(["FRAME_FILL", "SHAPE_FILL"]);
    expect(double.textStyles).toHaveLength(plan.textStyles.length);
    expect(double.effectStyles.every((s) => s.effects.every((e) => e.boundVariables.color.type === "VARIABLE_ALIAS"))).toBe(true);

    double.messages.length = 0;
    const second = await runPlugin(code(), double);
    expect(second).toMatchObject({ collectionsCreated: 0, variablesCreated: 0, variablesUpdated: total, textStylesCreated: 0, effectStylesCreated: 0 });
    expect(double.variables).toHaveLength(total);
  });

  it("reports the modes a plan limit refuses and fills the modes it has", async () => {
    const double = pluginDouble({ modeLimit: 1 });
    const report = await runPlugin(code(), double);
    expect(report.modesSkipped).toEqual(["Scnehaux / Color · Dark", "Scnehaux / Color · scnx-saas light", "Scnehaux / Color · scnx-saas dark", "Scnehaux / Dimension · scnx-saas"]);
    expect(double.collections.map((c) => c.modes.map((m) => m.name))).toEqual([["Light"], ["scnx-platform"]]);
    const canvas = double.variables.find((v) => v.name === "color/neutral/surface/canvas/default");
    expect(Object.keys(canvas.valuesByMode)).toHaveLength(1);
  });

  it("offers one choice per theme and mode, and fills a one-mode file with the chosen one (FG12)", async () => {
    expect(plan.choices.map((c) => `${c.theme} ${c.mode}`)).toEqual(["scnx-platform light", "scnx-platform dark", "scnx-saas light", "scnx-saas dark"]);
    const double = pluginDouble({ modeLimit: 1 });
    const report = await runPlugin(code(), double, 3);
    expect(report.errors).toEqual([]);
    expect(report.modesSkipped).toEqual([]);
    expect(double.collections.map((c) => c.modes.map((m) => m.name))).toEqual([["scnx-saas dark"], ["scnx-saas"]]);
    const canvas = double.variables.find((v) => v.name === "color/neutral/surface/canvas/default");
    const color = plan.collections[0];
    expect(Object.values(canvas.valuesByMode)).toEqual([color.variables.find((v) => v.name === canvas.name).values[3]]);
    expect(double.effectStyles.length).toBeGreaterThan(0);
    expect(double.effectStyles.every((s) => s.name.startsWith("scnx-saas/") && !s.name.startsWith("scnx-saas/Light/"))).toBe(true);
  });

  it("leaves variables it did not plan untouched and lists them", async () => {
    const double = pluginDouble({ modeLimit: 10 });
    const c = double.figma.variables.createVariableCollection(COLOR_COLLECTION);
    const stray = double.figma.variables.createVariable("brand/legacy", c, "COLOR");
    const report = await runPlugin(code(), double);
    expect(report.unplanned).toEqual([`${COLOR_COLLECTION} · brand/legacy`]);
    expect(double.variables).toContain(stray);
  });
});
