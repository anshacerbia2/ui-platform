import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../providers/theme-provider-base/ThemeProvider";
import { PopoverBase } from "./PopoverBase";
import type { PopoverBaseProps } from "./types";

const Themed = ({ children }: { children: ReactNode }) => (
  <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
    {children}
  </ThemeProvider>
);

const Share = (props: Partial<PopoverBaseProps>) => (
  <Themed>
    <PopoverBase {...props}>
      <PopoverBase.Trigger className="own">Share</PopoverBase.Trigger>
      <PopoverBase.Content className="pop">
        <PopoverBase.Title>Share link</PopoverBase.Title>
        <input aria-label="Link" readOnly value="https://scnx.dev/r/42" />
        <PopoverBase.Close>Done</PopoverBase.Close>
      </PopoverBase.Content>
    </PopoverBase>
    <button type="button">Elsewhere</button>
  </Themed>
);

const trigger = () => screen.getByRole("button", { name: "Share" });

describe("PopoverBase (TDD primitives P33)", () => {
  it("opens a non-modal dialog named by its title, reporting the state on its trigger", () => {
    render(<Share />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveClass("own");
    fireEvent.click(trigger());
    const dialog = screen.getByRole("dialog", { name: "Share link" });
    expect(dialog).not.toHaveAttribute("aria-modal");
    expect(dialog).toHaveClass("pop");
    expect(dialog.closest("[data-scnx-portal]")).not.toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", dialog.id);
  });

  it("moves focus into the content on open and back to the trigger on Escape and on Close", () => {
    render(<Share />);
    act(() => trigger().focus());
    fireEvent.click(trigger());
    expect(screen.getByRole("textbox", { name: "Link" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger()).toHaveFocus();
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("closes on a press outside without taking focus from where the reader moved it", () => {
    render(<Share />);
    fireEvent.click(trigger());
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    fireEvent.pointerDown(elsewhere);
    act(() => elsewhere.focus());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(elsewhere).toHaveFocus();
  });

  it("toggles from its trigger and composes a child trigger with asChild", () => {
    render(
      <Themed>
        <PopoverBase>
          <PopoverBase.Trigger asChild>
            <a href="#filters" role="button">
              Filters
            </a>
          </PopoverBase.Trigger>
          <PopoverBase.Content aria-label="Filters">Only active</PopoverBase.Content>
        </PopoverBase>
      </Themed>,
    );
    const link = screen.getByRole("button", { name: "Filters" });
    fireEvent.click(link);
    expect(screen.getByRole("dialog", { name: "Filters" })).toHaveFocus();
    fireEvent.click(link);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is controlled by open and onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(<Share open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
