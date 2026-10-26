import type { ComponentPropsWithRef, ReactNode } from "react";
import type { LinkBaseProps } from "../link-base/types";

export type NavigationBarBaseRootProps = Omit<ComponentPropsWithRef<"header">, "ref">;

export type NavigationBarBaseStartProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseCenterProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseEndProps = Omit<ComponentPropsWithRef<"div">, "ref">;

export type NavigationBarBaseNavProps = {
  children: ReactNode;
};

/** A link of the bar: LinkBase (TDD primitives P30), a native `a href` or `asChild`. */
export type NavigationBarBaseLinkProps = LinkBaseProps & {
  /** The link is the page the reader is on: `aria-current="page"`. */
  current?: boolean;
};