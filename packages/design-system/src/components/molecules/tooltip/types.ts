import type { TooltipBaseContentProps, TooltipBaseProps } from "@scnx/core-ui/components/tooltip-base";
import type { ReactElement, ReactNode } from "react";

export type TooltipProps = Omit<TooltipBaseProps, "children"> & {
  /** A few words, or one sentence at most, that name or explain the trigger; a Kbd for its shortcut. */
  content: ReactNode;
  /** The trigger: one focusable element, such as an IconButton. */
  children: ReactElement;
  /** Props of the tooltip element, such as a class name. */
  contentProps?: TooltipBaseContentProps;
};
