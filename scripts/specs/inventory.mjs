#!/usr/bin/env node
// Component specification gate (ADR-UIP-CMP-001; TDD primitives P20-P23).
//
//   node scripts/specs/inventory.mjs           check every specification; write the behavior inventory
//   node scripts/specs/inventory.mjs --check   check, and fail if the committed inventory differs
//   node scripts/specs/inventory.mjs --self-test

import fs from "node:fs";
import { INVENTORY, inventoryFrom, loadSpecs, serialize, specFindings } from "./specs.mjs";
import { contrastPairs, styledFindings } from "./styled.mjs";

function selfTest() {
  const ok = Object.assign(() => true, { errors: [] });
  const bad = Object.assign(() => false, { errors: [{ instancePath: "/stability", message: "must be equal to one of the allowed values" }] });
  const primitive = (over = {}) => ({
    kind: "primitive",
    name: "XBase",
    entry: "@scnx/core-ui/components/x-base",
    parts: [{ name: "a" }],
    keys: [{ key: "Enter", part: "a", expect: { part: "a" } }],
    ...over,
  });
  const row = (spec, file = "x/x-base.spec.json", entry = "@scnx/core-ui/components/x-base") => ({ file, entry, spec });
  const count = (rows, found, validate = { primitive: ok, entry: ok }) => specFindings(rows, found, validate).length;
  const cases = [
    [count([row(primitive())], ["x/x-base.spec.json"]), 0],
    [count([row(undefined)], []), 1],
    [count([row(primitive())], ["x/x-base.spec.json", "y/stray.spec.json"]), 1],
    [count([row({ ...primitive(), kind: "widget" })], ["x/x-base.spec.json"]), 1],
    [count([row(primitive())], ["x/x-base.spec.json"], { primitive: bad, entry: ok }), 1],
    [count([row(primitive({ entry: "@scnx/core-ui/components/y-base" }))], ["x/x-base.spec.json"]), 1],
    [count([row(primitive({ keys: [{ key: "Enter", part: "b" }] }))], ["x/x-base.spec.json"]), 1],
    [count([row(primitive({ keys: [{ key: "Enter", part: "a", expect: { part: "b" } }] }))], ["x/x-base.spec.json"]), 1],
    [count([row(primitive({ parts: [{ name: "a" }, { name: "a" }] }))], ["x/x-base.spec.json"]), 1],
    [count([row(primitive()), row(primitive({ entry: "@scnx/core-ui/components/z-base" }), "z/z-base.spec.json", "@scnx/core-ui/components/z-base")], ["x/x-base.spec.json", "z/z-base.spec.json"]), 1],
  ];
  // TDD styled CS2-CS3, CS5 on a two-variant component.
  const spec = {
    kind: "styled",
    entry: "@scnx/system/components/x",
    primitive: null,
    anatomy: [{ name: "root", selector: ".scnx-x" }],
    options: { tone: { values: ["a", "b"], default: "a", selector: "[data-tone={value}]" } },
    states: [{ name: "disabled", selectors: [":disabled", "[data-disabled]"], enter: { props: { disabled: true } } }],
    fixture: { props: {} },
    bindings: [
      { part: "root", declarations: { gap: "{dimension.gap}" } },
      { part: "root", option: { tone: "a" }, declarations: { color: "{color.fg}", background: "{color.bg}" } },
      { part: "root", option: { tone: "a" }, state: "disabled", declarations: { color: "{color.off}" } },
    ],
  };
  const css = (tone = "a", disabled = ":disabled,.scnx-x[data-tone=a][data-disabled]") =>
    `.scnx-x{gap:var(--ds-dimension-gap);display:flex}.scnx-x[data-tone=${tone}]{color:var(--ds-color-fg);background:var(--ds-color-bg)}.scnx-x[data-tone=a]${disabled}{color:var(--ds-color-off)}`;
  const context = (over = {}) => ({ css: css(), report: 'tone?: "a" | "b";', tokens: new Set(["dimension.gap", "color.fg", "color.bg", "color.off"]), ...over });
  cases.push(
    [styledFindings(spec, context()).length, 0],
    [styledFindings(spec, context({ css: css("b") })).length > 0, true],
    [styledFindings(spec, context({ css: css("a", ":disabled") })).length, 1],
    [styledFindings(spec, context({ report: 'tone?: "a";' })).length, 1],
    [styledFindings(spec, context({ tokens: new Set(["dimension.gap", "color.fg", "color.bg"]) })).length, 1],
    [styledFindings(spec, context({ css: `${css()}.scnx-x:hover{color:var(--ds-color-fg)}` })).length, 1],
    [contrastPairs(spec).length, 1],
  );
  // CS7-CS8: a child part, a root state, a literal override, and cascade order.
  const nested = {
    ...spec,
    anatomy: [{ name: "root", selector: ".scnx-x" }, { name: "item", selector: ".scnx-x > [data-part=item]" }],
    states: [{ name: "invalid", on: "root", selectors: ["[data-invalid]"], enter: { props: { error: "x" } } }, { name: "selected", selectors: ["[aria-selected=true]"], enter: { fixture: true } }],
    bindings: [
      { part: "item", declarations: { "border-bottom": "{dimension.gap} solid transparent" } },
      { part: "item", state: "selected", declarations: { "border-bottom-color": "{color.fg}" } },
      { part: "item", option: { tone: "b" }, declarations: { "border-bottom": "0" } },
      { part: "item", state: "invalid", declarations: { color: "{color.off}" } },
    ],
  };
  const nestedCss = (swap = false) => {
    const selected = ".scnx-x>[data-part=item][aria-selected=true]{border-bottom-color:var(--ds-color-fg)}";
    const tone = ".scnx-x[data-tone=b]>[data-part=item]{border-bottom:0}";
    return `.scnx-x>[data-part=item]{border-bottom:var(--ds-dimension-gap) solid transparent}${swap ? tone + selected : selected + tone}.scnx-x[data-invalid]>[data-part=item]{color:var(--ds-color-off)}`;
  };
  cases.push(
    [styledFindings(nested, context({ css: nestedCss() })).length, 0],
    [styledFindings(nested, context({ css: nestedCss(true) })).length, 1],
    [styledFindings(nested, context({ css: nestedCss().replace("[data-invalid]", "[data-error]") })).length > 0, true],
  );
  // CS14: recorded geometry matches the stylesheet in both directions.
  const sized = { ...spec, geometry: [{ part: "root", declarations: { "block-size": "2.25rem" } }, { part: "root", option: { tone: "b" }, declarations: { "block-size": "1.75rem" } }] };
  const sizedCss = (b = "1.75rem", extra = "") => `${css()}.scnx-x{block-size:2.25rem}.scnx-x[data-tone=b]{block-size:${b}${extra}}`;
  cases.push(
    [styledFindings(sized, context({ css: sizedCss() })).length, 0],
    [styledFindings(sized, context({ css: sizedCss("2rem") })).length, 1],
    [styledFindings(sized, context({ css: sizedCss("1.75rem", ";inline-size:1.75rem") })).length, 1],
    [styledFindings(sized, context({ css: css() })).length, 2],
    [styledFindings({ ...sized, geometry: [{ part: "root", declarations: { "block-size": "{dimension.gap}" } }] }, context({ css: sizedCss() })).length > 0, true],
    [styledFindings(spec, context({ css: sizedCss() })).length, 0],
  );
  const failed = cases.map(([actual, want], i) => [i, actual, want]).filter(([, actual, want]) => actual !== want);
  if (failed.length > 0) {
    console.error(`Specification self-test failed: ${failed.map(([i, a, w]) => `case ${i} gave ${a}, expected ${w}`).join("; ")}`);
    process.exit(1);
  }
  console.log(`Specification self-test passed: ${cases.length} cases`);
}

function run(check) {
  const { specs, findings } = loadSpecs();
  if (findings.length > 0) {
    console.error(findings.join("\n"));
    process.exit(1);
  }
  const text = serialize(inventoryFrom(specs.map((row) => row.spec)));
  const kinds = specs.reduce((acc, { spec }) => ({ ...acc, [spec.kind]: (acc[spec.kind] ?? 0) + 1 }), {});
  if (check) {
    if (fs.readFileSync(INVENTORY, "utf8") !== text) {
      console.error(`${INVENTORY} differs from the specifications; run node scripts/specs/inventory.mjs and commit the result`);
      process.exit(1);
    }
  } else {
    fs.writeFileSync(INVENTORY, text);
  }
  console.log(`Specifications passed: ${specs.length} public entries, ${JSON.stringify(kinds)}; ${INVENTORY} ${check ? "matches" : "written"}`);
}

if (process.argv.includes("--self-test")) selfTest();
else run(process.argv.includes("--check"));
