"use client";

import { CollapsibleBaseContent } from "@scnx/core-ui/components/collapsible-base";
import type { AccordionContentProps } from "./types";
import { cx } from "styled-system/css";

/**
 * AccordionContent - Unified alias for the disclosure content.
 * Directly leverages CollapsibleBaseContent for animated transitions.
 */
export const AccordionContent = ({ 
  children, 
  className,
  ...rest 
}: AccordionContentProps) => {
  return (
    <CollapsibleBaseContent 
      className={cx("scnx-accordion__content", className)} 
      {...rest}
    >
      <div className="scnx-accordion__content-inner">
        {children}
      </div>
    </CollapsibleBaseContent>
  );
};

AccordionContent.displayName = "Accordion.Content";
