import type { AccordionBaseItemProps, AccordionBaseRootProps } from "@scnx/core-ui/components/accordion-base";
import type { HeadingTag } from "@scnx/core-ui/components/heading-base";
import type { CollapsibleBaseContentProps, CollapsibleBaseTriggerProps } from "@scnx/core-ui/components/collapsible-base";

export type AccordionRootProps = AccordionBaseRootProps & {
  /** `separated` draws each item as its own card; `stacked` draws one bordered group. @default "separated" */
  variant?: "separated" | "stacked";
};
export type AccordionItemProps = AccordionBaseItemProps;
export type AccordionTriggerProps = CollapsibleBaseTriggerProps & {
  /** Heading element around the trigger. @default "h3" */
  headingAs?: HeadingTag;
};
export type AccordionContentProps = CollapsibleBaseContentProps;
