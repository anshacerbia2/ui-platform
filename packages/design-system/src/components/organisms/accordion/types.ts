import type { ReactNode } from "react";
import type { 
  DisclosureRegistryOptions,
} from "@scnx/core-ui/components/disclosure-base";
import type { 
  CollapsibleBaseRootProps,
  CollapsibleBaseItemProps,
  CollapsibleBaseTriggerProps,
  CollapsibleBaseContentProps 
} from "@scnx/core-ui/components/collapsible-base";

export type AccordionRootProps = CollapsibleBaseRootProps;

export type AccordionItemProps = CollapsibleBaseItemProps;


export type AccordionTriggerProps = Omit<CollapsibleBaseTriggerProps, "children"> & {
  children: ReactNode | ((props: { isOpen: boolean; isClosing: boolean }) => ReactNode);
};

export type AccordionContentProps = CollapsibleBaseContentProps;
