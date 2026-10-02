// Behavior-inventory contract (TDD primitives PRM-002, P12): every
// stable-candidate interactive primitive has a schema-valid record, every
// part resolves to its declared element, and every key with an expectation
// produces it.
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BehaviorFixtures } from "../test/behavior-fixtures";
import { AccordionBase } from "./components/accordion-base";
import { ButtonBase } from "./components/button-base";
import { NavigationBase } from "./components/navigation-base";
import { SidebarBaseRoot, SidebarBaseToggle } from "./components/sidebar-base";
import { TableOfContentsBase } from "./components/table-of-contents-base";

type Part = { name: string; element: string; selector: string };
type Key = { key: string; part: string; condition: string; effect: string; expect?: { part: string; attribute: string; value: string } };
type Record = {
  name: string;
  entry: string;
  stability: "candidate" | "stable";
  root: string;
  parts: Part[];
  controlledProps: string[];
  states: string[];
  keys: Key[];
  focus: { initial: string; movement: string; restoration: string };
  accessibleName: string;
  dataHooks: string[];
};

const inventory = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../behavior-inventory.json"), "utf8")) as {
  schemaVersion: number;
  primitives: Record[];
};

// Interactive entries of @scnx/core-ui that must have a record.
const INTERACTIVE = ["ButtonBase", "AccordionBase", "NavigationBase", "TableOfContentsBase", "SidebarBase"];

const KEYS: { [key: string]: string } = { Enter: "{Enter}", Space: " ", Tab: "{Tab}" };

describe("behavior inventory", () => {
  it("has a schema-valid record for every interactive primitive", () => {
    expect(inventory.schemaVersion).toBe(1);
    expect(inventory.primitives.map((p) => p.name).sort()).toEqual([...INTERACTIVE].sort());
    for (const record of inventory.primitives) {
      expect(record.entry).toMatch(/^@scnx\/core-ui\/components\/[a-z-]+$/);
      expect(["candidate", "stable"]).toContain(record.stability);
      for (const field of ["parts", "controlledProps", "states", "keys", "dataHooks"] as const) expect(Array.isArray(record[field])).toBe(true);
      expect(Object.keys(record.focus).sort()).toEqual(["initial", "movement", "restoration"]);
      for (const key of record.keys) {
        expect(Object.keys(KEYS)).toContain(key.key);
        expect(record.parts.map((p) => p.name)).toContain(key.part);
        if (key.expect) expect(record.parts.map((p) => p.name)).toContain(key.expect.part);
      }
    }
  });

  const renderFixtures = () =>
    render(
      <BehaviorFixtures
        components={{
          ButtonBase,
          AccordionBase,
          NavigationBase,
          TableOfContentsBase,
          SidebarBaseRoot,
          SidebarBaseToggle,
        }}
      />,
    );

  for (const record of inventory.primitives) {
    it(`${record.name}: parts resolve to their declared elements and keys produce their effects`, async () => {
      const { container } = renderFixtures();
      const part = (name: string) => container.querySelector(record.parts.find((p) => p.name === name)!.selector) as HTMLElement;
      for (const p of record.parts) {
        const element = container.querySelector(p.selector);
        expect(element, `${record.name} part ${p.name}`).not.toBeNull();
        expect(element!.tagName.toLowerCase()).toBe(p.element);
      }
      for (const key of record.keys) {
        if (!key.expect) continue;
        const target = part(key.part);
        if (key.key !== "Tab") {
          target.focus();
          await userEvent.keyboard(KEYS[key.key]);
        }
        expect(part(key.expect.part), `${record.name} ${key.key}: ${key.effect}`).toHaveAttribute(key.expect.attribute, key.expect.value);
      }
    });
  }
});
