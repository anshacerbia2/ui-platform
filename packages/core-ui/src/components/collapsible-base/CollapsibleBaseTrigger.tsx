import type { MouseEvent } from "react";
import { useDisclosureItem } from "../disclosure-base/DisclosureContext";
import type { CollapsibleBaseTriggerProps } from "./types";

/**
 * CollapsibleBaseTrigger - a native button (Enter and Space activate it)
 * with `aria-expanded` and `aria-controls`. The consumer's onClick runs
 * first; `preventDefault` cancels the toggle (PRM-007). A disabled item's
 * trigger is disabled; an open item that may not close carries
 * `aria-disabled` (WAI-ARIA APG, Accordion).
 */
export const CollapsibleBaseTrigger = ({ children, onClick, ...rest }: CollapsibleBaseTriggerProps) => {
  const { open, disabled, locked, triggerId, contentId, toggle } = useDisclosureItem("CollapsibleBase.Trigger");
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) toggle();
  };
  return (
    <button
      {...rest}
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      aria-disabled={locked || undefined}
      disabled={disabled}
      data-state={open ? "open" : "closed"}
      onClick={handleClick}
    >
      {typeof children === "function" ? children({ isOpen: open }) : children}
    </button>
  );
};

CollapsibleBaseTrigger.displayName = "CollapsibleBaseTrigger";
