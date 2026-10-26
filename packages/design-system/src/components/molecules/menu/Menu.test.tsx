import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Kbd } from "../../atoms/kbd";
import { Menu } from "./Menu";

describe("Menu (TDD styled MN1-MN3)", () => {
  it("renders the menu-material menu with icons, shortcuts, a danger item, a group label, and a separator", () => {
    const onDelete = vi.fn();
    render(
      <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content className="extra">
            <Menu.Group>
              <Menu.Label>Project</Menu.Label>
              <Menu.Item icon={<svg />} shortcut={<Kbd>R</Kbd>} aria-keyshortcuts="R">
                Rename
              </Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Item variant="danger" onSelect={onDelete}>
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const menu = screen.getByRole("menu", { name: "Actions" });
    expect(menu).toHaveClass("scnx-menu", "extra");
    const rename = screen.getByRole("menuitem", { name: "Rename" });
    expect(rename).toHaveFocus();
    expect(rename.querySelector("[data-part=icon]")).toHaveAttribute("aria-hidden", "true");
    expect(rename.querySelector("[data-part=shortcut]")).toHaveAttribute("aria-hidden", "true");
    expect(rename).toHaveAttribute("aria-keyshortcuts", "R");
    expect(screen.getByRole("group", { name: "Project" })).toContainElement(rename);
    expect(screen.getByRole("separator")).toHaveAttribute("data-part", "separator");
    const remove = screen.getByRole("menuitem", { name: "Delete" });
    expect(remove).toHaveAttribute("data-variant", "danger");
    fireEvent.click(remove);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
