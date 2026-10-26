import type { ComponentPropsWithRef, ReactNode } from "react";

export type NavigationBarBaseRootProps = Omit<ComponentPropsWithRef<"header">, "ref">;

export type NavigationBarBaseStartProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseCenterProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseEndProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseNavProps = {
  children: ReactNode;
};

export type NavigationBarBaseLinkProps = ComponentPropsWithRef<"a"> & {
  /** The link is the page the reader is on: ria-current="page". */
  current?: boolean;
  /** Renders the single child element, for example a router Link, with the link's props. */
  asChild?: boolean;
};