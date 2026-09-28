import { FlexBase } from "@scnx/core-ui/components/flex-base";
import type { FlexProps } from "./types";
import { flexRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Styled flex container component utilizing the Enterprise Layout System.
 * Wraps `@scnx/core-ui/components/flex-base` and injects `flexRecipe` spacing values.
 *
 * @example
 * ```tsx
 * import { Flex } from "@scnx/system/components/layouts/flex";
 * 
 * <Flex direction="row" align="center" gap="4">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 * ```
 */
export const Flex = ({
  direction,
  align,
  justify,
  wrap,
  gap,
  className = "",
  ...rest
}: FlexProps) => {
  const recipeClass = flexRecipe({ direction, align, justify, wrap, gap });

  return <FlexBase className={cx(recipeClass, className)} {...rest} />;
};

Flex.displayName = "Flex";
