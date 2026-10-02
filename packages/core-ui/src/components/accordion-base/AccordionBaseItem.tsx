"use client";

import { CollapsibleBaseItem } from "../collapsible-base/CollapsibleBaseItem";
import type { AccordionBaseItemProps } from "./types";

/** AccordionBaseItem - one accordion section; see CollapsibleBaseItem. */
export const AccordionBaseItem = (props: AccordionBaseItemProps) => <CollapsibleBaseItem {...props} />;

AccordionBaseItem.displayName = "AccordionBaseItem";
