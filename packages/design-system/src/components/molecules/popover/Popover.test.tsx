import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../atoms/button";
import { Popover } from "./Popover";

describe("Popover (TDD styled PO1-PO2)", () => {
  it("opens the menu-material dialog from a Button trigger and closes from a Button", () => {
    render(
      <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">Share</Button>
          </Popover.Trigger>
          <Popover.Content className="extra">
            <Popover.Title>Share acme-dashboard</Popover.Title>
            <Popover.Body>People with the link can view deployments.</Popover.Body>
            <Popover.Actions>
              <Popover.Close asChild>
                <Button variant="secondary" size="small">
                  Done
                </Button>
              </Popover.Close>
            </Popover.Actions>
          </Popover.Content>
        </Popover>
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Share" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Share acme-dashboard" });
    expect(dialog).toHaveClass("scnx-popover", "extra");
    expect(screen.getByText("People with the link can view deployments.")).toHaveAttribute("data-part", "body");
    const done = screen.getByRole("button", { name: "Done" });
    expect(done).toHaveFocus();
    fireEvent.click(done);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
