import type { ReactElement } from "react";

import type { BoxBaseProps } from "./types";
import { Slot } from "../../utils/Slot";

/**
 * BoxBase - The most foundational structural layout wrapper.
 * 
 * Supports polymorphic rendering via the `asChild` pattern.
 * Contains zero styles, exposing structural identity via `data-slot="box"`.
 *
 * @example
 * ```tsx
 * import { BoxBase } from "@scnx/core-ui";
 * 
 * <BoxBase data-state="collapsed">
 *   <p>Content</p>
 * </BoxBase>
 * ```
 */
export const BoxBase = ({
  asChild,
  children,
  ...rest
}: BoxBaseProps): ReactElement => {
  const Component = asChild ? Slot : "div";

  return (
    <Component data-slot="box" {...rest}>
      {children}
    </Component>
  );
};

BoxBase.displayName = "BoxBase";
