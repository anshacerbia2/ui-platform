import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

export type PolymorphicProps<E extends ElementType> = {
  as?: E;
} & Omit<ComponentPropsWithRef<E>, "as">;

export type HeadingBaseProps<E extends ElementType = "h2"> = {
  /** The children to render. */
  children?: ReactNode;
} & PolymorphicProps<E>;
