import { useLayoutEffect } from "react";
import { computePosition, type FloatingPlacement } from "./position";

export type UseFloatingOptions = {
  placement: FloatingPlacement;
  /** Gap from the anchor, in px. @default 4 */
  offset?: number;
  /** Minimum distance from the viewport's edges, in px. @default 8 */
  padding?: number;
};

/**
 * Keeps an open floating part beside its anchor (TDD primitives P31). The part
 * is `position: fixed`; its containing block is measured on every update by
 * placing it at the origin first, so an ancestor that is transformed or
 * contained, which makes a fixed box relative to itself, still yields the
 * right place. Styles are set through the CSSOM, never as a markup attribute,
 * so a strict CSP that blocks `style` attributes does not apply (TDD theme
 * THM-009); the part renders only on the client, while open. The side it ends
 * on is `data-side`. It updates on scroll in any scroller, on resize, and when
 * either box changes size, at most once per frame.
 */
export function useFloating(open: boolean, anchor: HTMLElement | null, floating: HTMLElement | null, { placement, offset = 4, padding = 8 }: UseFloatingOptions): void {
  useLayoutEffect(() => {
    if (!open || !anchor || !floating) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const style = floating.style;
      style.setProperty("position", "fixed");
      style.setProperty("left", "0px");
      style.setProperty("top", "0px");
      const origin = floating.getBoundingClientRect();
      const box = anchor.getBoundingClientRect();
      const root = document.documentElement;
      const result = computePosition({
        anchor: { x: box.left, y: box.top, width: box.width, height: box.height },
        floating: { width: origin.width, height: origin.height },
        viewport: { width: root.clientWidth, height: root.clientHeight },
        placement,
        offset,
        padding,
        rtl: getComputedStyle(anchor).direction === "rtl",
      });
      style.setProperty("left", `${result.x - origin.left}px`);
      style.setProperty("top", `${result.y - origin.top}px`);
      floating.setAttribute("data-side", result.side);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(anchor);
    observer?.observe(floating);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, [open, anchor, floating, placement, offset, padding]);
}
