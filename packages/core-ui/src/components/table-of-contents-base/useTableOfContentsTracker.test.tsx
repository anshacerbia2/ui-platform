import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTableOfContentsTracker } from "./useTableOfContentsTracker";

const items = [{ id: "intro", title: "Intro", url: "#intro" }];

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion: reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe("useTableOfContentsTracker scrolling (TDD primitives P19)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  const setup = () => {
    const target = document.createElement("h2");
    target.id = "intro";
    document.body.append(target);
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    return renderHook(() => useTableOfContentsTracker({ items, navbarOffset: 0 }));
  };

  it("scrolls smoothly by default and jumps under reduced motion", () => {
    setReducedMotion(false);
    const smooth = setup();
    act(() => smooth.result.current.scrollTo("intro"));
    expect(window.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "smooth" }));
    smooth.unmount();

    setReducedMotion(true);
    const reduced = setup();
    act(() => reduced.result.current.scrollTo("intro"));
    expect(window.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("ends the programmatic scroll at scrollend, before the fallback timer", () => {
    vi.useFakeTimers();
    setReducedMotion(false);
    (window as unknown as { onscrollend: null }).onscrollend = null;
    const { result } = setup();
    act(() => result.current.scrollTo("intro"));
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      window.dispatchEvent(new Event("scrollend"));
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("falls back to a timer when no scrollend arrives", () => {
    vi.useFakeTimers();
    setReducedMotion(false);
    const { result } = setup();
    act(() => result.current.scrollTo("intro"));
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
