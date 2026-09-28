"use client";

import type { ReactNode } from "react";
import type { CollapsibleBaseTriggerProps } from "./types";
import { useDisclosureItem } from "../disclosure-base/DisclosureContext";

/**
 * Headless trigger for the CollapsibleBase.
 * 
 * Toggles the open/close state of the associated content. 
 * Support "Render Props" pattern to expose internal state to children.
 */
export const CollapsibleBaseTrigger = ({
  children,
  ...rest
}: CollapsibleBaseTriggerProps) => {
  const { isOpen, isClosing, toggle, id } = useDisclosureItem();

  const triggerId = `scnx-trigger-${id}`;
  const contentId = `scnx-content-${id}`;

  // Determine if children is a render function or a static node
  const renderedChildren = typeof children === "function" 
    ? (children as (props: { isOpen: boolean; isClosing: boolean }) => ReactNode)({ isOpen, isClosing })
    : children;

  return (
    <button
      id={triggerId}
      type="button"
      aria-controls={contentId}
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      data-closing={isClosing || undefined}
      onClick={toggle}
      {...rest}
    >
      {renderedChildren}
    </button>
  );
};

CollapsibleBaseTrigger.displayName = "CollapsibleBaseTrigger";
