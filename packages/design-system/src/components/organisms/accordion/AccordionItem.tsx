import { AccordionBaseItem } from "@scnx/core-ui/components/accordion-base";
import { AccordionTrigger } from "./AccordionTrigger";
import { AccordionContent } from "./AccordionContent";
import type { AccordionItemProps } from "./types";
import { cx } from "styled-system/css";

const AccordionItemBase = ({ className, ...rest }: AccordionItemProps) => (
  <AccordionBaseItem className={cx("scnx-accordion__item", className)} {...rest} />
);

export const AccordionItem = Object.assign(AccordionItemBase, {
  Trigger: AccordionTrigger,
  Content: AccordionContent,
  displayName: "AccordionItem",
});
