import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Surface } from "./Surface";

describe("Surface (TDD styled SF1-SF3)", () => {
  it("is a raised div with no padding by default, keeping its own class", () => {
    render(<Surface className="extra">Body</Surface>);
    const surface = screen.getByText("Body");
    expect(surface.tagName).toBe("DIV");
    expect(surface).toHaveClass("scnx-surface", "extra");
    expect(surface).toHaveAttribute("data-material", "raised");
    expect(surface).toHaveAttribute("data-padding", "none");
  });

  it("renders a closed `as` tag with its material, padding, and props", () => {
    render(
      <Surface as="section" material="panel" padding="compact" aria-label="Usage">
        <Surface material="well" padding="default">
          Inset
        </Surface>
      </Surface>,
    );
    const panel = screen.getByRole("region", { name: "Usage" });
    expect(panel.tagName).toBe("SECTION");
    expect(panel).toHaveAttribute("data-material", "panel");
    expect(panel).toHaveAttribute("data-padding", "compact");
    expect(screen.getByText("Inset")).toHaveAttribute("data-material", "well");
  });

  it("accepts only a layout tag and an on-page material, at the type level", () => {
    // @ts-expect-error Surface renders a layout tag, not a button
    const button = <Surface as="button" />;
    // @ts-expect-error floating materials stay with their overlay components
    const menu = <Surface material="menu" />;
    expect([button, menu]).toHaveLength(2);
  });
});
