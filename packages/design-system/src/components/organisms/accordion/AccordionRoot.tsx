import { AccordionBaseRoot } from "@scnx/core-ui/components/accordion-base";

import type { AccordionRootProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Accordion root: single by default (opening a section closes the open one).
 * Pass `type="multiple"` for independent sections.
 */
export const AccordionRoot = ({ className, variant = "separated", ...rest }: AccordionRootProps) => (
  <AccordionBaseRoot className={cx("scnx-accordion", className)} data-variant={variant} {...rest} />
);

AccordionRoot.displayName = "Accordion";
