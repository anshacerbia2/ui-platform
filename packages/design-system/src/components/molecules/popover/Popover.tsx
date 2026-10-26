import { PopoverBase } from "@scnx/core-ui/components/popover-base";
import { cx } from "styled-system/css";
import type { PopoverActionsProps, PopoverBodyProps, PopoverContentProps, PopoverProps, PopoverTitleProps } from "./types";

/**
 * Popover - a small interactive task anchored to its trigger (a share link, a
 * filter, a quick edit), on PopoverBase (APG non-modal dialog): the menu
 * material, 20rem wide, 4px from its trigger, with no stem. A list of commands
 * is a Menu; a blocking task is a Dialog. Needs a ThemeProvider, whose portal
 * container it renders into.
 *
 * @example
 * ```tsx
 * import { Popover } from "@scnx/system/components/popover";
 *
 * <Popover>
 *   <Popover.Trigger asChild><Button variant="secondary">Share</Button></Popover.Trigger>
 *   <Popover.Content>
 *     <Popover.Title>Share acme-dashboard</Popover.Title>
 *     <Popover.Body>People with the link can view deployments.</Popover.Body>
 *     <Popover.Actions>
 *       <Popover.Close asChild><Button variant="secondary" size="small">Done</Button></Popover.Close>
 *     </Popover.Actions>
 *   </Popover.Content>
 * </Popover>
 * ```
 */
const PopoverRoot = (props: PopoverProps) => <PopoverBase {...props} />;

const PopoverContent = ({ className, ...props }: PopoverContentProps) => <PopoverBase.Content {...props} className={cx("scnx-popover", className)} />;

const PopoverTitle = (props: PopoverTitleProps) => <PopoverBase.Title data-part="title" {...props} />;

const PopoverBody = (props: PopoverBodyProps) => <div data-part="body" {...props} />;

const PopoverActions = (props: PopoverActionsProps) => <div data-part="actions" {...props} />;

PopoverRoot.displayName = "Popover";
PopoverContent.displayName = "Popover.Content";
PopoverTitle.displayName = "Popover.Title";
PopoverBody.displayName = "Popover.Body";
PopoverActions.displayName = "Popover.Actions";

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverBase.Trigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Body: PopoverBody,
  Actions: PopoverActions,
  Close: PopoverBase.Close,
});
