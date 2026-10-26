import { TooltipBase } from "@scnx/core-ui/components/tooltip-base";
import { cx } from "styled-system/css";
import type { TooltipProps } from "./types";

/**
 * Tooltip - names or explains a control on hover and keyboard focus, on
 * TooltipBase (APG tooltip): the ink material, the only floating material in
 * ink, 4px from its trigger, with no stem. It never holds interactive
 * content; that is a Popover. Needs a ThemeProvider, whose portal container it
 * renders into.
 *
 * @example
 * ```tsx
 * import { Tooltip } from "@scnx/system/components/tooltip";
 *
 * <Tooltip content={<>Search <Kbd>⌘</Kbd><Kbd>K</Kbd></>}>
 *   <IconButton aria-label="Search">…</IconButton>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({ content, children, contentProps, ...props }: TooltipProps) => (
  <TooltipBase {...props}>
    <TooltipBase.Trigger>{children}</TooltipBase.Trigger>
    <TooltipBase.Content {...contentProps} className={cx("scnx-tooltip", contentProps?.className)}>
      {content}
    </TooltipBase.Content>
  </TooltipBase>
);

Tooltip.displayName = "Tooltip";
