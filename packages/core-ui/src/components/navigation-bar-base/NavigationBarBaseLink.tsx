import type { ReactElement } from "react";
import { LinkBase } from "../link-base/LinkBase";
import type { LinkBaseProps } from "../link-base/types";
import type { NavigationBarBaseLinkProps } from "./types";

/**
 * One destination of the navigation bar, on LinkBase (TDD primitives P29,
 * P30): a native `a href`, or with `asChild` its single child, for example a
 * router Link. `current` marks the page the reader is on with
 * `aria-current="page"`; a consumer's own `aria-current` wins.
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Link href="/docs" current>Docs</NavigationBarBase.Link>
 * <NavigationBarBase.Link asChild><RouterLink to="/blog">Blog</RouterLink></NavigationBarBase.Link>
 * ```
 */
export const NavigationBarBaseLink = ({ current = false, ...rest }: NavigationBarBaseLinkProps): ReactElement => (
  <LinkBase aria-current={current ? "page" : undefined} {...(rest as LinkBaseProps)} />
);

NavigationBarBaseLink.displayName = "NavigationBarBase.Link";
