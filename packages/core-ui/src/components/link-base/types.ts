import type { ComponentPropsWithRef, ReactElement } from "react";

/** A native link: a destination is required. */
export type LinkBaseAnchorProps = ComponentPropsWithRef<"a"> & {
  /** Destination; a link always has one. */
  href: string;
  asChild?: false;
};

/** The single child element, for example a router Link, receives the link's props (TDD primitives P2). */
export type LinkBaseChildProps = Omit<ComponentPropsWithRef<"a">, "children"> & {
  asChild: true;
  children: ReactElement;
};

export type LinkBaseProps = LinkBaseAnchorProps | LinkBaseChildProps;
