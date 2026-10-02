import type { AccordionBaseItemProps, AccordionBaseRootProps } from "@scnx/core-ui/components/accordion-base";
import type { HeadingTag } from "@scnx/core-ui/components/heading-base";
import type { CollapsibleBaseContentProps, CollapsibleBaseTriggerProps } from "@scnx/core-ui/components/collapsible-base";

export type AccordionRootProps = AccordionBaseRootProps;
export type AccordionItemProps = AccordionBaseItemProps;
export type AccordionTriggerProps = CollapsibleBaseTriggerProps & {
  /** Heading element around the trigger. @default "h3" */
  headingAs?: HeadingTag;
};
export type AccordionContentProps = CollapsibleBaseContentProps;
