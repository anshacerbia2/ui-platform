import type { ElementType, ReactElement } from "react";
import type { HeadingBaseProps } from "./types";

/**
 * HeadingBase - Typography primitive for semantic headings.
 * 
 * Supports polymorphic `as` prop for semantic SEO (h1-h6).
 * Broadcasts styling intentions via Data Contracts for Design System consumption.
 *
 * @example
 * ```tsx
 * import { HeadingBase, ContainerBase } from "@scnx/core-ui";
 * 
 * <ContainerBase>
 *   <HeadingBase as="h1" data-size="2xl">Page Title</HeadingBase>
 *   <HeadingBase as="h2" data-size="lg">Section Title</HeadingBase>
 * </ContainerBase>
 * ```
 */
export const HeadingBase = <E extends ElementType = "h2">({
  as: Component = "h2" as E,
  ...rest
}: HeadingBaseProps<E>): ReactElement => {
  return (
    <Component {...rest as any} />
  );
};

HeadingBase.displayName = "HeadingBase";
