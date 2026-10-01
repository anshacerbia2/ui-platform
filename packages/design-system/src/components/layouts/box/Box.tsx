import { BoxBase } from "@scnx/core-ui/components/box-base";
import { cx } from "styled-system/css";
import type { BoxProps } from "./types";

/**
 * Box - Foundational Structural Primitive.
 * 
 * Renders a `div`, or one tag of the closed LayoutTag union through `as`.
 * Acts as the base container for generic layout spacing integration.
 *
 * @example
 * ```tsx
 * import { Box } from "@scnx/system/components/box";
 * 
 * <Box className="my-class">
 *   <p>Content</p>
 * </Box>
 * ```
 */
export const Box = ({ className, ...rest }: BoxProps) => {
  return <BoxBase className={cx("scnx-box", className)} {...rest} />;
};

Box.displayName = "Box";
