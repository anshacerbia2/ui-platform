"use client";

import { useContext, useState, useEffect, useId } from "react";
import type { AccordionBaseItemProps } from "./types";
import { 
  useDisclosure,
  useDisclosureItem, 
  DisclosureIdProvider
} from "../disclosure-base/DisclosureContext";

/**
 * Specialized Accordion Item for the Registry Pattern.
 * 
 * Provides ONLY the unique ID to its children (Trigger/Content) via 
 * 'DisclosureIdProvider', allowing them to subscribe directly and 
 * automatically to the Root's Registry.
 */

/**
 * Internal logic for Accordion Item.
 */
const AccordionBaseItemInternal = ({
  children,
  disabled,
  ...rest
}: AccordionBaseItemProps) => {
  const { isOpen, setDisclosureState, orchestrated } = useDisclosureItem();

  // Lifecycle: Ensure this item is marked as orchestrated in the shared registry
  useEffect(() => {
    if (!orchestrated) {
      setDisclosureState({ orchestrated: true });
    }
  }, [orchestrated, setDisclosureState]);

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Specialized Accordion Item for the Registry Pattern.
 */
export const AccordionBaseItem = ({
  children,
  ...rest
}: AccordionBaseItemProps) => {
  // Check if we are in a Registry context
  const { registry } = useDisclosure();
  
  // Strict Auto-ID Enforcement: Identifier is always auto-generated
  const reactId = useId();
  const [id] = useState("scnx-acc-item-" + reactId);

  return (
    <DisclosureIdProvider id={id}>
      <AccordionBaseItemInternal {...rest}>
        {children}
      </AccordionBaseItemInternal>
    </DisclosureIdProvider>
  );
};

AccordionBaseItem.displayName = "AccordionBaseItem";
