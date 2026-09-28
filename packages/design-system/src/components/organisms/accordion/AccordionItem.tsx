import { CollapsibleBase } from "@scnx/core-ui/components/collapsible-base";
import { AccordionTrigger } from "./AccordionTrigger";
import { AccordionContent } from "./AccordionContent";
import type { AccordionItemProps } from "./types";
import { cx } from "styled-system/css";

/**
 * AccordionItem - Identity Provider.
 * Acts as a participant in the Disclosure Registry.
 */
const AccordionItemBase = ({
  children,
  className,
  orchestrated = true,
  ...rest
}: AccordionItemProps) => {
  return (
    <CollapsibleBase.Item
      className={cx("scnx-accordion__item", className)}
      orchestrated={orchestrated}
      {...rest}
    >
      {children}
    </CollapsibleBase.Item>
  );
};

const AccordionItemCompound = Object.assign(AccordionItemBase, {
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export const AccordionItem = AccordionItemCompound as typeof AccordionItemBase & {
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
  displayName: string;
};

AccordionItem.displayName = "AccordionItem";



