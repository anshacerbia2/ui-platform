"use client";

export type { 
  AccordionBaseRootProps,
  AccordionBaseItemProps,
  AccordionBaseHeaderProps,
  AccordionType,
} from "./types";

export { AccordionBase } from "./AccordionBase";
export { AccordionBaseRoot } from "./AccordionBaseRoot";
export { AccordionBaseItem } from "./AccordionBaseItem";
export { AccordionBaseHeader } from "./AccordionBaseHeader";

// Reached from this entry's public signatures (TDD packaging RC7).
export type {
  CollapsibleBaseContentProps,
  CollapsibleBaseItemProps,
  CollapsibleBaseRootProps,
  CollapsibleBaseTriggerProps,
} from "../collapsible-base/types";
export type { ClosedAsProps, HeadingTag } from "../../types/polymorphic";
export type {
  DisclosureItemOptions,
  DisclosureProviderProps,
} from "../disclosure-base/types";
