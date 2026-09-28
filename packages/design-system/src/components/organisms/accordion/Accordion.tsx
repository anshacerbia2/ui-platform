"use client";

import { AccordionRoot } from "./AccordionRoot";
import { AccordionItem } from "./AccordionItem";
import { AccordionTrigger } from "./AccordionTrigger";
import { AccordionContent } from "./AccordionContent";
import type { AccordionRootProps } from "./types";

const AccordionCompound = (props: AccordionRootProps) => (
  <AccordionRoot {...props} />
);

AccordionCompound.displayName = "Accordion";

/**
 * Accordion - The design system organism for multi-item selection.
 * Fully integrated with Disclosure Registry v2 and TransitionBase.
 */
export const Accordion = Object.assign(AccordionCompound, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
