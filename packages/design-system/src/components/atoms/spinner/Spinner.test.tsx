import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner (TDD styled SP1-SP2)", () => {
  it("is a polite status named by its label", () => {
    render(<Spinner label="Loading deployments" size="large" className="extra" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading deployments");
    expect(status).toHaveClass("scnx-spinner", "extra");
    expect(status).toHaveAttribute("data-size", "large");
  });

  it("is hidden from assistive technology without a label", () => {
    const { container } = render(
      <button type="button">
        <Spinner /> Saving
      </button>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector(".scnx-spinner")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".scnx-spinner")).toHaveAttribute("data-size", "small");
    expect(screen.getByRole("button", { name: "Saving" })).toBeInTheDocument();
  });
});
