import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ComboboxBase } from "./ComboboxBase";
import type { ComboboxBaseItem } from "./types";

const ITEMS: ComboboxBaseItem[] = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python", disabled: true },
  { value: "rs", label: "Rust" },
];

const Fixture = (props: { defaultValue?: string; onValueChange?: (v: string) => void }) => (
  <ComboboxBase items={ITEMS} {...props}>
    <ComboboxBase.Input aria-label="Language" />
    <ComboboxBase.Listbox aria-label="Languages" />
    <ComboboxBase.Status>{(n) => `${n} options`}</ComboboxBase.Status>
  </ComboboxBase>
);

const input = () => screen.getByRole("combobox", { name: "Language" });
const listbox = () => screen.getByRole("listbox", { hidden: true });
const option = (label: string) => screen.getByRole("option", { name: label, hidden: true });

describe("ComboboxBase (TDD primitives P18)", () => {
  it("renders an editable combobox with list autocomplete, closed", () => {
    render(<Fixture defaultValue="ts" />);
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveAttribute("aria-controls", listbox().id);
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(input()).toHaveValue("TypeScript");
    expect(listbox()).toHaveAttribute("hidden");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("Down opens the list on the first option; Down and Up move without wrapping and skip disabled options", async () => {
    render(<Fixture />);
    input().focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).toHaveAttribute("aria-activedescendant", option("TypeScript").id);
    expect(option("TypeScript")).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Rust").id);
    await userEvent.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Rust").id);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("TypeScript").id);
    expect(option("Python")).toHaveAttribute("aria-disabled", "true");
  });

  it("Up opens the list on the last enabled option; Alt+Down opens without an active option; Alt+Up closes", async () => {
    render(<Fixture />);
    input().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", option("Rust").id);
    await userEvent.keyboard("{Escape}{Alt>}{ArrowDown}{/Alt}");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(input()).toHaveAttribute("aria-expanded", "false");
  });

  it("Enter accepts the active option, places its label in the input, and closes", async () => {
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    input().focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("js");
    expect(input()).toHaveValue("JavaScript");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveFocus();
  });

  it("typing filters the options, clears the active option, and announces the count", async () => {
    render(<Fixture defaultValue="ts" />);
    input().focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.clear(input());
    await userEvent.type(input(), "script");
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["TypeScript", "JavaScript"]);
    expect(screen.getByRole("status")).toHaveTextContent("2 options");
  });

  it("Left, Right, Home, and End keep the caret native and clear the active option", async () => {
    render(<Fixture defaultValue="ts" />);
    input().focus();
    for (const key of ["{ArrowLeft}", "{ArrowRight}", "{Home}", "{End}"]) {
      await userEvent.keyboard("{ArrowDown}");
      expect(input()).toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard(key);
      expect(input()).not.toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard("{Escape}");
    }
  });

  it("Escape closes the list and restores the accepted label", async () => {
    render(<Fixture defaultValue="ts" />);
    input().focus();
    await userEvent.clear(input());
    await userEvent.type(input(), "ja");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveValue("TypeScript");
  });

  it("a pointer press on an option keeps focus in the input and accepts it, with no timer", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    await userEvent.click(input());
    expect(input()).toHaveAttribute("aria-expanded", "true");
    const pressed = fireEvent.mouseDown(option("Rust"));
    expect(pressed).toBe(false);
    fireEvent.click(option("Rust"));
    expect(onValueChange).toHaveBeenCalledWith("rs");
    expect(input()).toHaveFocus();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("a disabled option cannot be accepted by pointer", async () => {
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    await userEvent.click(input());
    fireEvent.click(option("Python"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("blur closes the list and restores the accepted label", async () => {
    render(
      <>
        <Fixture defaultValue="ts" />
        <button type="button">Elsewhere</button>
      </>,
    );
    input().focus();
    await userEvent.type(input(), "x");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveValue("TypeScript");
  });

  it("is controlled through value and onValueChange", async () => {
    const Controlled = () => {
      const [value, setValue] = useState<string | null>("rs");
      return (
        <ComboboxBase items={ITEMS} value={value} onValueChange={setValue}>
          <ComboboxBase.Input aria-label="Language" />
          <ComboboxBase.Listbox aria-label="Languages" />
        </ComboboxBase>
      );
    };
    render(<Controlled />);
    expect(input()).toHaveValue("Rust");
    input().focus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(input()).toHaveValue("TypeScript");
  });
});
