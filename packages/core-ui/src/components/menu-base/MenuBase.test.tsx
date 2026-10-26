import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../providers/theme-provider-base/ThemeProvider";
import { MenuBase } from "./MenuBase";
import type { MenuBaseProps } from "./types";

const Themed = ({ children }: { children: ReactNode }) => (
  <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
    {children}
  </ThemeProvider>
);

const Actions = ({ onRename = () => {}, onDelete = () => {}, ...props }: Partial<MenuBaseProps> & { onRename?: () => void; onDelete?: () => void }) => (
  <Themed>
    <MenuBase {...props}>
      <MenuBase.Trigger className="own">Actions</MenuBase.Trigger>
      <MenuBase.Content className="menu">
        <MenuBase.Group>
          <MenuBase.Label>Project</MenuBase.Label>
          <MenuBase.Item onSelect={onRename}>Rename</MenuBase.Item>
          <MenuBase.Item>Duplicate</MenuBase.Item>
          <MenuBase.Item disabled>Archive</MenuBase.Item>
          <MenuBase.Item>Download</MenuBase.Item>
        </MenuBase.Group>
        <MenuBase.Separator />
        <MenuBase.Item onSelect={onDelete}>Delete</MenuBase.Item>
      </MenuBase.Content>
    </MenuBase>
    <button type="button">Elsewhere</button>
  </Themed>
);

const trigger = () => screen.getByRole("button", { name: "Actions" });
const item = (name: string) => screen.getByRole("menuitem", { name });
const key = (k: string) => fireEvent.keyDown(document.activeElement!, { key: k });

describe("MenuBase (TDD primitives P34)", () => {
  it("is a menu button whose menu is named by its trigger, with groups and separators", () => {
    render(<Actions />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveClass("own");
    fireEvent.click(trigger());
    const menu = screen.getByRole("menu", { name: "Actions" });
    expect(menu).toHaveClass("menu");
    expect(menu.closest("[data-scnx-portal]")).not.toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getByRole("group", { name: "Project" })).toContainElement(item("Rename"));
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(item("Archive")).toHaveAttribute("aria-disabled", "true");
    expect(item("Rename")).toHaveFocus();
  });

  it("opens from the keyboard at the first item, or at the last with ArrowUp", () => {
    render(<Actions />);
    act(() => trigger().focus());
    key("ArrowDown");
    expect(item("Rename")).toHaveFocus();
    key("Escape");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger()).toHaveFocus();
    key("ArrowUp");
    expect(item("Delete")).toHaveFocus();
    key("Escape");
    key("Enter");
    expect(item("Rename")).toHaveFocus();
  });

  it("moves between enabled items with the arrows, wraps, and goes to the ends with Home and End", () => {
    render(<Actions />);
    act(() => trigger().focus());
    key("ArrowDown");
    key("ArrowDown");
    expect(item("Duplicate")).toHaveFocus();
    key("ArrowDown");
    expect(item("Download")).toHaveFocus();
    key("ArrowDown");
    key("ArrowDown");
    expect(item("Rename")).toHaveFocus();
    key("ArrowUp");
    expect(item("Delete")).toHaveFocus();
    key("Home");
    expect(item("Rename")).toHaveFocus();
    key("End");
    expect(item("Delete")).toHaveFocus();
  });

  it("jumps by type-ahead, cycling through items that start with a repeated letter", () => {
    render(<Actions />);
    act(() => trigger().focus());
    key("ArrowDown");
    key("d");
    expect(item("Duplicate")).toHaveFocus();
    key("d");
    expect(item("Download")).toHaveFocus();
    key("d");
    expect(item("Delete")).toHaveFocus();
  });

  it("runs an item on Enter and on a click, then closes and returns focus to the trigger", () => {
    const onRename = vi.fn();
    const onDelete = vi.fn();
    render(<Actions onRename={onRename} onDelete={onDelete} />);
    act(() => trigger().focus());
    key("Enter");
    key("Enter");
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger()).toHaveFocus();
    fireEvent.click(trigger());
    fireEvent.click(item("Delete"));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveFocus();
  });

  it("never runs a disabled item, and keeps the menu open when onSelect prevents the default", () => {
    render(
      <Themed>
        <MenuBase defaultOpen>
          <MenuBase.Trigger>More</MenuBase.Trigger>
          <MenuBase.Content>
            <MenuBase.Item onSelect={(event) => event.preventDefault()}>Stay</MenuBase.Item>
            <MenuBase.Item disabled onSelect={() => {}}>
              Off
            </MenuBase.Item>
          </MenuBase.Content>
        </MenuBase>
      </Themed>,
    );
    fireEvent.click(item("Off"));
    fireEvent.click(item("Stay"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Tab with focus on the trigger, and on a press outside without moving focus", () => {
    render(<Actions />);
    act(() => trigger().focus());
    key("ArrowDown");
    key("Tab");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger()).toHaveFocus();
    fireEvent.click(trigger());
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    fireEvent.pointerDown(elsewhere);
    act(() => elsewhere.focus());
    expect(screen.queryByRole("menu")).toBeNull();
    expect(elsewhere).toHaveFocus();
  });

  it("focuses an item under a moving pointer", () => {
    render(<Actions />);
    fireEvent.click(trigger());
    fireEvent.pointerMove(item("Download"));
    expect(item("Download")).toHaveFocus();
    fireEvent.pointerMove(item("Archive"));
    expect(item("Download")).toHaveFocus();
  });
});
