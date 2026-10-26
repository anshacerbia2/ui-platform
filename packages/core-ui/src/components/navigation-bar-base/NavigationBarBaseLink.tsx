import type { ReactElement } from "react";
import { Slot } from "../../utils/Slot";
import type { NavigationBarBaseLinkProps } from "./types";

/**
 * One destination of the navigation bar: a native `a href`, or with `asChild`
 * its single child, for example a router Link, which receives the link's props
 * (TDD primitives P2). `current` marks the page the reader is on with
 * `aria-current="page"` (TDD primitives P8).
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Link href="/docs" current>Docs</NavigationBarBase.Link>
 * <NavigationBarBase.Link asChild><RouterLink to="/blog">Blog</RouterLink></NavigationBarBase.Link>
 * ```
 */
export const NavigationBarBaseLink = ({ asChild = false, current = false, ...rest }: NavigationBarBaseLinkProps): ReactElement => {
  const props = { "data-slot": "link", "aria-current": current ? ("page" as const) : undefined, ...rest };
  return asChild ? <Slot {...props} /> : <a {...props} />;
};

NavigationBarBaseLink.displayName = "NavigationBarBase.Link";
