import { HeadingBase } from "@scnx/core-ui/components/heading-base";

import type { HeadingProps, HeadingTag } from "./types";
import { headingRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Heading - Tier 1 Atomic Component.
 * 
 * Styled heading component utilizing the Enterprise Heading System.
 * Separates semantic tag (as) from visual styling (size, weight).
 * Renders a semantic `<h1-h6>` (or other) element based on `as` prop.
 * 
 * @example
 * ```tsx
 * import { Heading } from "@scnx/system/components/heading";
 * 
 * <Heading as="h1" size="xlarge">Page Title</Heading>
 * <Heading size="small" weight="bold">Section Header</Heading>
 * ```
 */
export const Heading = <T extends HeadingTag = "h2">({
  size,
  weight,
  className = "",
  ...rest
}: HeadingProps<T>) => {
  const recipeClass = headingRecipe({ size, weight });

  return (
    <HeadingBase<T>
      className={cx(recipeClass, className)}
      {...rest as any}
    />
  );
};

Heading.displayName = "Heading";
