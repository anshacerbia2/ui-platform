import type { ComponentPropsWithRef } from "react";

export type {
  PopoverBaseCloseProps as PopoverCloseProps,
  PopoverBaseContentProps as PopoverContentProps,
  PopoverBaseProps as PopoverProps,
  PopoverBaseTitleProps as PopoverTitleProps,
  PopoverBaseTriggerProps as PopoverTriggerProps,
} from "@scnx/core-ui/components/popover-base";

/** The popover's text, in the subtle color. */
export type PopoverBodyProps = ComponentPropsWithRef<"div">;

/** The popover's actions, at its end. */
export type PopoverActionsProps = ComponentPropsWithRef<"div">;
