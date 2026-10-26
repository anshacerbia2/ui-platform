import { useCallback, useState } from "react";

/** Open state of a floating part: controlled (`open` with `onOpenChange`) or uncontrolled (`defaultOpen`). */
export type OpenStateProps = {
  /** Whether the part is open (controlled). */
  open?: boolean;
  /** Whether the part starts open (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** Called with the requested open state; a controlled owner applies it. */
  onOpenChange?: (open: boolean) => void;
};

/** The open state and a setter that reports every change once. */
export function useOpenState({ open, defaultOpen = false, onOpenChange }: OpenStateProps): [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const current = open ?? uncontrolled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === current) return;
      if (open === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [current, open, onOpenChange],
  );
  return [current, setOpen];
}
