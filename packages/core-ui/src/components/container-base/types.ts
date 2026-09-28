import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

export type PolymorphicProps<E extends ElementType> = {
  as?: E;
} & Omit<ComponentPropsWithRef<E>, "as">;

export type ContainerBaseProps<E extends ElementType = "div"> = {
  /** The children to render. */
  children?: ReactNode;
} & PolymorphicProps<E>;
