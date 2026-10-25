import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

describe("SegmentedControl", () => {
  it("is a named radiogroup of native radios, medium by default", () => {
    render(
      <SegmentedControl aria-label="Range" defaultValue="7d">
        <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
        <SegmentedControl.Item value="7d">7 days</SegmentedControl.Item>
      </SegmentedControl>,
    );
    const group = screen.getByRole("radiogroup", { name: "Range" });
    expect(group).toHaveClass("scnx-segmented-control");
    expect(group).toHaveAttribute("data-size", "medium");
    expect(screen.getByRole("radio", { name: "7 days" })).toBeChecked();
    expect(screen.getByText("7 days").closest("label")).toHaveAttribute("data-state", "checked");
  });

  // Arrow keys are the native radio group's; RadioGroupBase's tests and the Default story cover them.
  it("checks a segment by click and reports the change", () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl aria-label="View" size="small" defaultValue="grid" onValueChange={onValueChange}>
        <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-size", "small");
    fireEvent.click(screen.getByRole("radio", { name: "List" }));
    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    expect(screen.getByText("List").closest("label")).toHaveAttribute("data-state", "checked");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("list");
  });

  it("names an icon segment by its aria-label", () => {
    render(
      <SegmentedControl aria-label="Mode" defaultValue="dark">
        <SegmentedControl.Item value="light" aria-label="Light">
          <svg aria-hidden="true" />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="dark" aria-label="Dark">
          <svg aria-hidden="true" />
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });
});
