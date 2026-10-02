import type { ReactElement } from "react";
import type { LayoutTag } from "../../types/polymorphic";
import type { FlexBaseProps } from "./types";

/**
 * FlexBase - headless layout element with no interaction (TDD primitives,
 * Stable-candidate inventory). Renders a `div`, or one tag of the closed
 * {@link LayoutTag} union through `as`.
 *
 * @example
 * ```tsx
 * <FlexBase as="section" aria-labelledby="title">...</FlexBase>
 * ```
 */
export const FlexBase = <T extends LayoutTag = "div">({ as, ...rest }: FlexBaseProps<T>): ReactElement => {
  const Tag = (as ?? "div") as "div";
  return <Tag data-slot="flex" {...(rest as FlexBaseProps<"div">)} />;
};

FlexBase.displayName = "FlexBase";
