import type { ReactElement } from "react";
import { Slot } from "../../utils/Slot";
import type { GridBaseProps } from "./types";

/**
 * GridBase - Layout primitive for 2D grid layouts.
 * 
 * Supports polymorphic rendering via the `asChild` pattern.
 * Exposes layout intentions via Data Contracts (`data-*` attributes)
 * for Design System CSS targeting (columns, rows, gap, gap-x, gap-y).
 *
 * @example
 * ```tsx
 * import { GridBase } from "@scnx/core-ui";
 * 
 * <GridBase data-columns="3" data-gap="4">
 *   <p>Column 1</p>
 *   <p>Column 2</p>
 *   <p>Column 3</p>
 * </GridBase>
 * ```
 */
export const GridBase = ({
  asChild,
  children,
  ...rest
}: GridBaseProps): ReactElement => {
  const Component = asChild ? Slot : "div";

  return (
    <Component data-slot="grid" {...rest}>
      {children}
    </Component>
  );
};

GridBase.displayName = "GridBase";
