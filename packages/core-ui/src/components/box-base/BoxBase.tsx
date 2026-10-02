import type { ReactElement } from "react";
import type { LayoutTag } from "../../types/polymorphic";
import type { BoxBaseProps } from "./types";

/**
 * BoxBase - headless layout element with no interaction (TDD primitives,
 * Stable-candidate inventory). Renders a `div`, or one tag of the closed
 * {@link LayoutTag} union through `as`.
 *
 * @example
 * ```tsx
 * <BoxBase as="section" aria-labelledby="title">...</BoxBase>
 * ```
 */
export const BoxBase = <T extends LayoutTag = "div">({ as, ...rest }: BoxBaseProps<T>): ReactElement => {
  const Tag = (as ?? "div") as "div";
  return <Tag data-slot="box" {...(rest as BoxBaseProps<"div">)} />;
};

BoxBase.displayName = "BoxBase";
