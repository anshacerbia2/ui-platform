"use client";

import { CollapsibleBaseTrigger } from "@scnx/core-ui/components/collapsible-base";
import type { AccordionTriggerProps } from "./types";
import { cx } from "styled-system/css";

/**
 * AccordionTrigger - Unified alias for the disclosure trigger.
 * Inherits all collapsible logic and styles it for the accordion context.
 */
export const AccordionTrigger = ({ 
  children, 
  className,
  ...rest 
}: AccordionTriggerProps) => {
  return (
    <CollapsibleBaseTrigger 
      className={cx("scnx-accordion__trigger", className)} 
      {...rest}
    >
      {children}
    </CollapsibleBaseTrigger>
  );
};

AccordionTrigger.displayName = "Accordion.Trigger";
