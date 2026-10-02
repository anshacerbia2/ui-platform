import type { AccordionBaseRootProps } from "./types";
import { AccordionBaseRoot as Root } from "./AccordionBaseRoot";
import { AccordionBaseItem as Item } from "./AccordionBaseItem";
import { AccordionBaseHeader as Header } from "./AccordionBaseHeader";
import { CollapsibleBaseTrigger as Trigger } from "../collapsible-base/CollapsibleBaseTrigger";
import { CollapsibleBaseContent as Content } from "../collapsible-base/CollapsibleBaseContent";

/**
 * AccordionBase — Headless accordion primitive with composable API.
 * 
 * Built by composing multiple CollapsibleBase components with a shared 
 * selection mode orchestrator. Supports single and multiple modes.
 *
 * @example
 * ```tsx
 * <AccordionBase type="single">
 *   <AccordionBase.Item value="item-1">
 *     <AccordionBase.Header>
 *       <AccordionBase.Trigger>Item 1</AccordionBase.Trigger>
 *     </AccordionBase.Header>
 *     <AccordionBase.Content>Content 1</AccordionBase.Content>
 *   </AccordionBase.Item>
 * </AccordionBase>
 * ```
 */
const AccordionBaseCompound = ({ ...rest }: AccordionBaseRootProps) => (
  <Root {...rest} />
);

AccordionBaseCompound.displayName = "AccordionBase";

export const AccordionBase = Object.assign(AccordionBaseCompound, {
  Root,
  Item,
  Header,
  Trigger,
  Content,
});
