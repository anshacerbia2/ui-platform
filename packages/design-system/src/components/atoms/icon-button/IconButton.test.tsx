import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("is a native button named by aria-label, secondary and medium by default", () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Close" onClick={onClick}>
        <svg aria-hidden="true" />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("scnx-icon-btn");
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button).toHaveAttribute("data-size", "medium");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can be named by another element", () => {
    render(
      <>
        <span id="label">Open settings</span>
        <IconButton aria-labelledby="label" variant="ghost" size="small">
          <svg aria-hidden="true" />
        </IconButton>
      </>,
    );
    const button = screen.getByRole("button", { name: "Open settings" });
    expect(button).toHaveAttribute("data-variant", "ghost");
    expect(button).toHaveAttribute("data-size", "small");
  });

  it("keeps link semantics in link mode, and a disabled link leaves the tab order", () => {
    render(
      <IconButton aria-label="Settings" href="#settings" disabled>
        <svg aria-hidden="true" />
      </IconButton>,
    );
    const link = screen.getByLabelText("Settings");
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
  });

  it("requires an accessible name in its type", () => {
    // @ts-expect-error an icon button without aria-label or aria-labelledby does not type-check
    const unnamed = <IconButton>×</IconButton>;
    // @ts-expect-error both naming attributes at once do not type-check
    const both = <IconButton aria-label="Close" aria-labelledby="label">×</IconButton>;
    expect([unnamed, both]).toHaveLength(2);
  });
});
