import type { ReactElement } from "react";

import type { FlexBaseProps } from "./types";
import { Slot } from "../../utils/Slot";

/**
 * FlexBase - Layout primitive for flexible 1D layouts.
 * 
 * Supports polymorphic rendering via the `asChild` pattern.
 * Exposes layout intentions via Data Contracts (`data-*` attributes)
 * for Design System CSS targeting (direction, align, justify, wrap, gap).
 *
 * @example
 * ```tsx
 * import { FlexBase, ButtonBase } from "@scnx/core-ui";
 * 
 * <FlexBase data-justify="between" data-align="center">
 *   <h1>Dashboard</h1>
 *   <FlexBase data-gap="4">
 *     <ButtonBase>Cancel</ButtonBase>
 *     <ButtonBase>Submit</ButtonBase>
 *   </FlexBase>
 * </FlexBase>
 * ```
 */
export const FlexBase = ({
  asChild,
  children,
  ...rest
}: FlexBaseProps): ReactElement => {
  const Component = asChild ? Slot : "div";

  return (
    <Component data-slot="flex" {...rest}>
      {children}
    </Component>
  );
};

FlexBase.displayName = "FlexBase";
