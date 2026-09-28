"use client";

import { useEffect, useId } from "react";
import type { CollapsibleBaseItemProps } from "./types";
import { 
  useDisclosure,
  DisclosureIdProvider,
} from "../disclosure-base/DisclosureContext";

/**
 * CollapsibleBaseItem - Unified Identity & Logic Provider.
 * Generates a unique ID, registers with the registry, and manages DOM state.
 */
export const CollapsibleBaseItem = ({
  children,
  defaultOpen,
  isOpen: explicitIsOpen,
  onOpenChange,
  orchestrated,
  className,
  ...rest
}: CollapsibleBaseItemProps) => {
  const { 
    registry, 
    setRegistryItem, 
    regItemListener, 
    detachRegistryItem 
  } = useDisclosure();
  
  // 1. Identity Management: Fixed ID for the lifecycle of this item (SSR Safe)
  const id = useId();

  // 2. Logic Access: Get state directly from registry using our stable ID
  const itemState = registry[id] || { 
    isOpen: false, 
    isClosing: false, 
    orchestrated: orchestrated ?? false 
  };
  const { isOpen, isClosing, orchestrated: currentOrchestrated } = itemState;

  // 3. Registry Registration: Initial state on mount
  useEffect(() => {
    setRegistryItem(id, { 
      isOpen: !!defaultOpen, 
      isClosing: false, 
      orchestrated: orchestrated ?? false 
    });
  }, []); // Mount only

  // 4. Lifecycle Cleanup: Detach from registry on unmount
  useEffect(() => {
    return () => {
      detachRegistryItem(id);
    };
  }, [id, detachRegistryItem]);

  // 5. Orchestration Sync: Single/Multi mode participation
  useEffect(() => {
    const targetOrchestrated = orchestrated ?? false;
    if (targetOrchestrated !== currentOrchestrated) {
      setRegistryItem(id, { orchestrated: targetOrchestrated });
    }
  }, [orchestrated, currentOrchestrated, id, setRegistryItem]);

  // 6. Registry -> Callback Bridge
  useEffect(() => {
    if (!onOpenChange) return;
    return regItemListener(id, (state) => onOpenChange(state.isOpen));
  }, [id, onOpenChange, regItemListener]);

  // 7. Prop -> Registry Bridge (Controlled State)
  useEffect(() => {
    if (explicitIsOpen !== undefined && explicitIsOpen !== isOpen) {
      setRegistryItem(id, { isOpen: explicitIsOpen, isClosing: false });
    }
  }, [explicitIsOpen, isOpen, id, setRegistryItem]);

  return (
    <DisclosureIdProvider id={id}>
      <div
        id={id}
        className={className}
        data-state={isOpen ? "open" : "closed"}
        {...rest}
      >
        {children}
      </div>
    </DisclosureIdProvider>
  );
};




CollapsibleBaseItem.displayName = "CollapsibleBaseItem";
