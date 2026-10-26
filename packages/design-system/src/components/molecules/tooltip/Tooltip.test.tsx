import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip (TDD styled TT1-TT2)", () => {
  it("renders the ink tooltip for its trigger into the theme's portal container", () => {
    render(
      <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
        <Tooltip content="Copy link" contentProps={{ className: "extra" }}>
          <button type="button" aria-label="Copy link">
            Copy
          </button>
        </Tooltip>
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Copy link" });
    act(() => trigger.focus());
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveClass("scnx-tooltip", "extra");
    expect(tooltip).toHaveTextContent("Copy link");
    expect(tooltip.closest("[data-scnx-portal]")).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });
});
