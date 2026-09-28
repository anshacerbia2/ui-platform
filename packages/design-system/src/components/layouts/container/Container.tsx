import type { ElementType } from "react";

import { ContainerBase } from "@scnx/core-ui/components/container-base";

import type { ContainerProps } from "./types";
import { containerRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Constrains content width and provides centered layout.
ilizing the Enterprise Layout System.
 * Wraps `@scnx/core-ui/container-base` and applies `containerRecipe`.
 * Renders a semantic `<div>` (polymorphic via `as` prop).
 *
 * @example
 * ```tsx
 * import { Container } from "@scnx/system/container";
 * 
 * <Container size="base">
 *   <div>Content goes here</div>
 * </Container>
 * ```
 */
export const Container = <E extends ElementType = "div">({
  size = "base",
  className = "",
  ...rest
}: ContainerProps<E>) => {
  const recipeClass = containerRecipe({ size });

  return (
    <ContainerBase 
      {...(rest as any)} 
      className={cx(recipeClass, className)} 
    />
  );
};

Container.displayName = "Container";
