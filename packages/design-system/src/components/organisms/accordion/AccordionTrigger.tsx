import { AccordionBaseHeader } from "@scnx/core-ui/components/accordion-base";
import { CollapsibleBaseTrigger } from "@scnx/core-ui/components/collapsible-base";

import type { AccordionTriggerProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Accordion trigger inside its heading (TDD primitives P5; WAI-ARIA APG
 * Accordion). `headingAs` sets the heading level for the page outline.
 */
export const AccordionTrigger = ({ className, headingAs = "h3", ...rest }: AccordionTriggerProps) => (
  <AccordionBaseHeader as={headingAs} className="scnx-accordion__header">
    <CollapsibleBaseTrigger className={cx("scnx-accordion__trigger", className)} {...rest} />
  </AccordionBaseHeader>
);

AccordionTrigger.displayName = "Accordion.Trigger";
