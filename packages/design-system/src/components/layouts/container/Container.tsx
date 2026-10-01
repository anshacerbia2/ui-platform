import { ContainerBase } from "@scnx/core-ui/components/container-base";

import type { ContainerProps } from "./types";
import type { LayoutTag } from "@scnx/core-ui/components/container-base";
import { containerRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Constrains content width and provides centered layout.
ilizing the Enterprise Layout System.
 * Wraps `@scnx/core-ui/components/container-base` and applies `containerRecipe`.
 * Renders a semantic `<div>` (polymorphic via `as` prop).
 *
 * @example
 * ```tsx
 * import { Container } from "@scnx/system/components/container";
 * 
 * <Container size="base">
 *   <div>Content goes here</div>
 * </Container>
 * ```
 */
export const Container = <T extends LayoutTag = "div">({
  size = "base",
  className = "",
  ...rest
}: ContainerProps<T>) => {
  const recipeClass = containerRecipe({ size });

  return (
    <ContainerBase<T> {...(rest as ContainerProps<T>)} className={cx(recipeClass, className)} />
  );
};

Container.displayName = "Container";
