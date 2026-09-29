import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal separator with default data attributes", () => {
    render(<Divider />);
    const separator = screen.getByRole("separator");

    expect(separator).toHaveClass("scnx-divider");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-weight", "normal");
    expect(separator).toHaveAttribute("data-color", "default");
  });

  it("exposes vertical orientation to assistive technology", () => {
    render(<Divider orientation="vertical" className="consumer" />);
    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveClass("scnx-divider", "consumer");
  });
});
