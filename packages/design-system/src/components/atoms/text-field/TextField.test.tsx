import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("adds the styled class to the root and keeps the base semantics", () => {
    const { container } = render(<TextField label="Email" error="Enter an email address" className="consumer" />);
    expect(container.firstElementChild).toHaveClass("scnx-text-field", "consumer");
    expect(container.firstElementChild).toHaveAttribute("data-invalid", "");
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter an email address");
  });

  it("leads the error with a hidden icon and renders none without an error", () => {
    const { container, rerender } = render(<TextField label="Email" error="Enter an email address" />);
    const icon = container.querySelector("[data-part=error] > svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");

    rerender(<TextField label="Email" />);
    expect(container.querySelector("[data-part=error]")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Email" })).not.toHaveAttribute("aria-invalid");
  });
});
