import type { ReactElement } from "react";
import { Slot } from "../../utils/Slot";
import type { LinkBaseProps } from "./types";

/**
 * LinkBase - navigation to a destination (TDD primitives P30): a native
 * `a href`, which the browser makes focusable, activates with Enter, and opens
 * in a new tab on request, or with `asChild` its single child, for example a
 * router Link, which receives the link's props under the rules of P2. An
 * action that does not navigate is a button, not a link.
 *
 * @example
 * ```tsx
 * <LinkBase href="/changelog">Changelog</LinkBase>
 * <LinkBase asChild><RouterLink to="/changelog">Changelog</RouterLink></LinkBase>
 * ```
 */
export const LinkBase = (props: LinkBaseProps): ReactElement => {
  if (props.asChild) {
    const { asChild: _, ...rest } = props;
    return <Slot data-slot="link" {...rest} />;
  }
  const { asChild: _, ...rest } = props;
  return <a data-slot="link" {...rest} />;
};

LinkBase.displayName = "LinkBase";
