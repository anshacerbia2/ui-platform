import type { ReactElement } from "react";
import type { DividerBaseProps } from "./types";

/**
 * DividerBase - Headless horizontal or vertical separator.
 * 
 * Provides semantic `role="separator"` and broadcasts orientation/styling
 * via data attributes for Design System consumption.
 *
 * @example
 * ```tsx
 * import { DividerBase, FlexBase } from "@scnx/core-ui";
 * 
 * <FlexBase data-direction="col">
 *   <div>Top Section</div>
 *   <DividerBase orientation="horizontal" weight="thin" />
 *   <div>Bottom Section</div>
 * </FlexBase>
 * ```
 */
export const DividerBase = ({
  className,
  orientation = "horizontal",
  weight = "normal",
  color = "default",
  ...rest
}: DividerBaseProps): ReactElement => {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={className}
      data-orientation={orientation}
      data-weight={weight}
      data-color={color}
      {...rest}
    />
  );
};

DividerBase.displayName = "DividerBase";
