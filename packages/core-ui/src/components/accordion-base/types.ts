import type { ComponentPropsWithRef, ReactNode } from "react";

/**
 * Selection mode for the Accordion.
 * - single: Only one item can be expanded at a time.
 * - multiple: Multiple items can be expanded independently.
 */
export type AccordionType = "single" | "multiple";

/**
 * Context value for the Accordion orchestrator.
 */
export type AccordionContextValue = {
  /** The type of accordion (single/multiple) */
  type: AccordionType;
  /** Handler to change expanded state */
  setRegistryItem: (id: string, isOpen: boolean) => void;
};

/**
 * Props for the Accordion root.
 */
export type AccordionBaseRootProps = {
  /** The selection mode */
  type?: AccordionType;

  /** Whether to disable animations and unmount immediately */
  disabledAnimations?: boolean;
  /** Accordion content */
  children: ReactNode;
} & ComponentPropsWithRef<"div">;

/**
 * Props for an individual Accordion item.
 */
export type AccordionBaseItemProps = {
  /** Item content */
  children: ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
} & ComponentPropsWithRef<"div">;
