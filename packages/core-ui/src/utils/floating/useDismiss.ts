import { useEffect, useRef } from "react";

export type DismissReason = "escape" | "outside";

/**
 * Reports a dismissal of an open floating part (TDD primitives P31): Escape
 * anywhere in the document, or a pointer pressed outside every given element
 * (the anchor and the part, so a press on the trigger is the trigger's own).
 * Escape is handled once: the innermost open part, the last to register,
 * takes it and stops it reaching the others.
 */
export function useDismiss(open: boolean, elements: Array<HTMLElement | null>, onDismiss: (reason: DismissReason) => void): void {
  const latest = useRef(onDismiss);
  latest.current = onDismiss;
  const inside = useRef(elements);
  inside.current = elements;
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      latest.current("escape");
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && inside.current.some((element) => element?.contains(target))) return;
      latest.current("outside");
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);
}
