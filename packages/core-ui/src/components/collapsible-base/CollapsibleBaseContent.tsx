"use client";

import type { CollapsibleBaseContentProps } from "./types";
import { useDisclosureItem } from "../disclosure-base/DisclosureContext";
import { TransitionBase } from "../transition-base";

/**
 * Headless content wrapper for the CollapsibleBase.
 * 
 * Acts as a "Presence Protector" that manages DOM mounting/unmounting based 
 * on both the logical `isOpen` state and the terminal `isClosing` signal 
 * from the Global Registry.
 * 
 * Automatically detects the target item ID from its parent (e.g. Accordion.Item).
 */
export const CollapsibleBaseContent = ({
  children,
  forceMount = false,
  style,
  ...rest
}: CollapsibleBaseContentProps) => {
  const { isOpen, isClosing, setDisclosureState, id, disabledAnimations } = useDisclosureItem();
  const contentId = `scnx-content-${id}`;

  /**
   * The "Presence Gate": ONLY render if open, force-mounted, or currently closing.
   */
  const shouldRender = isOpen || forceMount || isClosing;

  if (!shouldRender) return null;

  return (
    <TransitionBase
      id={contentId}
      disabled={disabledAnimations}
      open={!isClosing}
      onClosed={() => setDisclosureState({ isOpen: false, isClosing: false })}
      styleFrom={{ height: 0, opacity: 0, overflow: "hidden" }}
      styleTo={{ height: "auto", opacity: 1, overflow: "visible" }}
      style={style}
      {...rest}
    >
      {children}
    </TransitionBase>
  );
};

CollapsibleBaseContent.displayName = "CollapsibleBaseContent";
