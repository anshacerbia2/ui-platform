import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress (TDD styled PG1-PG2)", () => {
  it("is a native progress bar named by its visible label, reading the formatted value", () => {
    render(<Progress label="Storage" value={7.2} max={10} valueText="7.2 of 10 GB" scheme="danger" className="extra" />);
    const bar = screen.getByRole("progressbar", { name: "Storage" });
    expect(bar.tagName).toBe("PROGRESS");
    expect(bar).toHaveAttribute("value", "7.2");
    expect(bar).toHaveAttribute("max", "10");
    expect(bar).toHaveAttribute("aria-valuetext", "7.2 of 10 GB");
    expect(bar.closest(".scnx-progress")).toHaveClass("extra");
    expect(bar.closest(".scnx-progress")).toHaveAttribute("data-scheme", "danger");
    // The value is drawn once and read once, through the bar.
    expect(screen.getByText("7.2 of 10 GB")).toHaveAttribute("aria-hidden", "true");
  });

  it("clamps the value to the range and holds no style attribute", () => {
    const { container } = render(<Progress label="Upload" value={140} />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("value", "100");
    expect(container.querySelector("[style]")).toBeNull();
    expect(container.querySelector(".scnx-progress")).toHaveAttribute("data-scheme", "primary");
  });
});
