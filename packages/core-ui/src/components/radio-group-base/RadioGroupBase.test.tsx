import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroupBase } from "./RadioGroupBase";
import type { RadioGroupBaseProps } from "./types";

const Theme = (props: Partial<RadioGroupBaseProps>) => (
  <RadioGroupBase {...({ "aria-label": "Theme", ...props } as RadioGroupBaseProps)}>
    <RadioGroupBase.Item value="light">Light</RadioGroupBase.Item>
    <RadioGroupBase.Item value="dark">Dark</RadioGroupBase.Item>
    <RadioGroupBase.Item value="system">System</RadioGroupBase.Item>
  </RadioGroupBase>
);

const item = (name: string) => screen.getByText(name).closest("label")!;

describe("RadioGroupBase (TDD primitives P28)", () => {
  it("is a named radiogroup of native radios sharing one name", () => {
    render(<Theme defaultValue="dark" />);
    const group = screen.getByRole("radiogroup", { name: "Theme" });
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((r) => (r as HTMLInputElement).name)).size).toBe(1);
    expect(group).toContainElement(radios[0]);
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(item("Dark")).toHaveAttribute("data-state", "checked");
    expect(item("Light")).toHaveAttribute("data-state", "unchecked");
  });

  it("checks an item on click anywhere on its label, and reports the change once", async () => {
    const onValueChange = vi.fn();
    render(<Theme defaultValue="light" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText("System"));
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(item("System")).toHaveAttribute("data-state", "checked");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("system");
    await userEvent.click(screen.getByText("System"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("moves and checks with arrow keys, wrapping, and skips a disabled item", async () => {
    render(
      <RadioGroupBase aria-label="Density" defaultValue="compact">
        <RadioGroupBase.Item value="compact">Compact</RadioGroupBase.Item>
        <RadioGroupBase.Item value="default" disabled>
          Default
        </RadioGroupBase.Item>
        <RadioGroupBase.Item value="comfortable">Comfortable</RadioGroupBase.Item>
      </RadioGroupBase>,
    );
    screen.getByRole("radio", { name: "Compact" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Comfortable" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Compact" })).toBeChecked();
    expect(item("Default")).toHaveAttribute("data-disabled");
  });

  it("is controlled by value and onValueChange", async () => {
    const Controlled = () => {
      const [value, setValue] = useState("light");
      return <Theme value={value} onValueChange={setValue} />;
    };
    render(<Controlled />);
    await userEvent.click(screen.getByText("Dark"));
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();

    const onValueChange = vi.fn();
    render(
      <RadioGroupBase aria-label="Fixed" value="a" onValueChange={onValueChange}>
        <RadioGroupBase.Item value="a">A</RadioGroupBase.Item>
        <RadioGroupBase.Item value="b">B</RadioGroupBase.Item>
      </RadioGroupBase>,
    );
    await userEvent.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });

  it("names an icon-only item's radio by its aria-label", () => {
    render(
      <RadioGroupBase aria-label="Mode" defaultValue="dark">
        <RadioGroupBase.Item value="light" aria-label="Light">
          <svg aria-hidden="true" />
        </RadioGroupBase.Item>
        <RadioGroupBase.Item value="dark" aria-label="Dark">
          <svg aria-hidden="true" />
        </RadioGroupBase.Item>
      </RadioGroupBase>,
    );
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Light" }).closest("label")).not.toHaveAttribute("aria-label");
  });

  it("disables every item from the root and marks the group", () => {
    render(<Theme defaultValue="light" disabled />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("requires a name and an Item inside the group", () => {
    // @ts-expect-error a radio group without aria-label or aria-labelledby does not type-check
    const unnamed = <RadioGroupBase defaultValue="a" />;
    expect(unnamed).toBeTruthy();
    expect(() => render(<RadioGroupBase.Item value="x">X</RadioGroupBase.Item>)).toThrow("RadioGroupBase.Item must be rendered inside RadioGroupBase");
  });
});
