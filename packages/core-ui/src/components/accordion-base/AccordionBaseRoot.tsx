"use client";

import { useContext, useState, useEffect, useId } from "react";
import type { AccordionBaseRootProps } from "./types";
import { 
  DisclosureProvider,
  DisclosureIdProvider,
  useHasDisclosureContext,
  useDisclosureItem
} from "../disclosure-base/DisclosureContext";

/**
 * PATH 1: STANDALONE MANAGER
 */
const AccordionStandaloneManager = ({
  children,
  type = "single",
  disabledAnimations,
  ...rest
}: AccordionBaseRootProps) => {
  return (
    <DisclosureProvider
      type={type}
      disabledAnimations={disabledAnimations}
    >
      <div
        data-type={type}
        {...rest}
      >
        {children}
      </div>
    </DisclosureProvider>
  );
};

/**
 * PATH 2: REGISTRY BRIDGE (For Nested Submenus)
 * Joins the parent registry (Flat Context) but maintains a UNIQUE Identity.
 */
const AccordionRegistryBridgeInternal = ({
  children,
  type = "single",
  ...rest
}: AccordionBaseRootProps) => {
  const { isOpen, detachRegistryItem, id } = useDisclosureItem();

  // Participant Logic
  useEffect(() => {
    return () => {
      detachRegistryItem(id);
    };
  }, [id, detachRegistryItem]);

  return (
    <DisclosureProvider
      type={type}
      disabledAnimations={false}
    >
      <div
        data-type={type}
        data-state={isOpen ? "open" : "closed"}
        {...rest}
      >
        {children}
      </div>
    </DisclosureProvider>
  );
};

const AccordionRegistryBridge = (props: AccordionBaseRootProps) => {
  // FLAT CONTEXT POLICY: Generate a unique identity in the parent registry
  const reactId = useId();
  const [id] = useState(reactId);

  return (
    <DisclosureIdProvider id={id}>
      <AccordionRegistryBridgeInternal {...props} />
    </DisclosureIdProvider>
  );
};

/**
 * ATOMIC DISPATCHER: AccordionBaseRoot
 */
export const AccordionBaseRoot = (props: AccordionBaseRootProps) => {
  const hasParentContext = useHasDisclosureContext();

  if (hasParentContext) {
    return <AccordionRegistryBridge {...props} />;
  }

  return <AccordionStandaloneManager {...props} />;
};

AccordionBaseRoot.displayName = "AccordionBaseRoot";
