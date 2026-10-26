import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../providers/theme-provider-base/ThemeProvider";
import { TooltipBase } from "./TooltipBase";
import type { TooltipBaseProps } from "./types";

const Themed = ({ children }: { children: ReactNode }) => (
  <ThemeProvider themeId="scnx-platform" defaultMode="light" storage={false}>
    {children}
  </ThemeProvider>
);

const Copy = (props: Partial<TooltipBaseProps>) => (
  <Themed>
    <TooltipBase {...props}>
      <TooltipBase.Trigger>
        <button type="button" aria-label="Copy link" className="own">
          ⧉
        </button>
      </TooltipBase.Trigger>
      <TooltipBase.Content className="tip">Copy link</TooltipBase.Content>
    </TooltipBase>
  </Themed>
);

const trigger = () => screen.getByRole("button", { name: "Copy link" });

describe("TooltipBase (TDD primitives P32)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens after the delay on a resting pointer, describes its trigger, and closes when the pointer leaves", () => {
    render(<Copy />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(399));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Copy link");
    expect(tooltip).toHaveClass("tip");
    expect(tooltip.closest("[data-scnx-portal]")).not.toBeNull();
    expect(trigger()).toHaveAttribute("aria-describedby", tooltip.id);
    expect(trigger()).toHaveClass("own");
    fireEvent.pointerLeave(trigger(), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger()).not.toHaveAttribute("aria-describedby");
  });

  it("stays open while the pointer moves onto the tooltip (WCAG 2.2 SC 1.4.13)", () => {
    render(<Copy delay={0} />);
    fireEvent.pointerEnter(trigger(), { pointerType: "mouse" });
    fireEvent.pointerLeave(trigger(), { pointerType: "mouse" });
    fireEvent.pointerEnter(screen.getByRole("tooltip"), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("opens at once on keyboard focus, and closes on Escape with focus kept, on blur, and on a press", () => {
    render(<Copy />);
    act(() => trigger().focus());
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger()).toHaveFocus();
    act(() => {
      trigger().blur();
      trigger().focus();
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    act(() => trigger().blur());
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => trigger().focus());
    fireEvent.pointerDown(trigger());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("does not open on touch", () => {
    render(<Copy delay={0} />);
    fireEvent.pointerEnter(trigger(), { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("is controlled by open and onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(<Copy open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders nothing and reports a diagnostic without a ThemeProvider", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <TooltipBase open>
        <TooltipBase.Trigger>
          <button type="button">Save</button>
        </TooltipBase.Trigger>
        <TooltipBase.Content>Save the draft</TooltipBase.Content>
      </TooltipBase>,
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("TooltipBase needs a ThemeProvider"));
    error.mockRestore();
  });
});
