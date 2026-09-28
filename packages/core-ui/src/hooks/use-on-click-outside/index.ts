import type { RefObject } from "react";
import { useEffect } from "react";

type AnyEvent = MouseEvent | TouchEvent;

/**
 * Hook to detect clicks outside of specified elements.
 *
 * @param ref - Single ref, element, or array of refs/elements to monitor
 * @param handler - Callback when click occurs outside
 * @param mouseEvent - Type of mouse event to listen for (default: "click")
 *
 * @example
 * @example
 * ```tsx
 * const ref = useRef(null);
 * useOnClickOutside(ref, () => console.log('Clicked outside'));
 * return <div ref={ref}>Hello</div>;
 * ```
 *
 * @example
 * // Conditional disable
 * useOnClickOutside(ref, isEnabled ? handler : null);
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | T | (RefObject<T> | T | null)[] | null,
  handler: ((event: AnyEvent) => void) | null | undefined,
  mouseEvent: "click" | "mousedown" | "mouseup" = "click"
): void => {
  useEffect(() => {
    if (!ref || !handler) return;

    const listener = (event: AnyEvent) => {
      const el = event.target as Node;
      const refs = Array.isArray(ref) ? ref : [ref];
      const isInside = refs.some((r) => {
        if (!r) return false;
        if ("current" in r && r.current) {
          return r.current.contains(el);
        }
        if (r instanceof HTMLElement) {
          return r.contains(el);
        }
        return false;
      });

      if (isInside) return;
      handler(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, mouseEvent, handler]);
}
