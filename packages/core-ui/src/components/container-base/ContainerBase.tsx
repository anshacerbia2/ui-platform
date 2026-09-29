import type { ElementType, ReactElement } from "react";
import type { ContainerBaseProps } from "./types";

/**
 * ContainerBase - Layout primitive for bounding content width and centering.
 * 
 * Supports polymorphic `as` prop for semantic HTML flexibility.
 * Broadcasts size information via `data-size` attribute for Design System styling.
 *
 * @example
 * ```tsx
 * import { ContainerBase } from "@scnx/core-ui/components/container-base";
 * 
 * <ContainerBase as="main" data-size="lg">
 *   <section>Content goes here</section>
 * </ContainerBase>
 * ```
 */
export const ContainerBase = <E extends ElementType = "div">({
  as,
  children,
  ...rest
}: ContainerBaseProps<E>): ReactElement => {
  const Component = as || "div";

  return (
    <Component {...rest}>
      {children}
    </Component>
  );
};

ContainerBase.displayName = "ContainerBase";
