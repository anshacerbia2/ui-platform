import { CollapsibleBaseRoot } from "../collapsible-base/CollapsibleBaseRoot";
import type { AccordionBaseRootProps } from "./types";

/**
 * AccordionBaseRoot - single/multiple disclosure orchestration (TDD
 * primitives, Single Accordion update). Single by default: opening an item
 * closes the open one; `collapsible={false}` keeps one item open.
 */
export const AccordionBaseRoot = ({ type = "single", ...rest }: AccordionBaseRootProps) => <CollapsibleBaseRoot type={type} {...rest} />;

AccordionBaseRoot.displayName = "AccordionBaseRoot";
