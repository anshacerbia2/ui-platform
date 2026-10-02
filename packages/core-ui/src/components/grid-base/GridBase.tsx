import type { ReactElement } from "react";
import type { LayoutTag } from "../../types/polymorphic";
import type { GridBaseProps } from "./types";

/**
 * GridBase - headless layout element with no interaction (TDD primitives,
 * Stable-candidate inventory). Renders a `div`, or one tag of the closed
 * {@link LayoutTag} union through `as`.
 *
 * @example
 * ```tsx
 * <GridBase as="section" aria-labelledby="title">...</GridBase>
 * ```
 */
export const GridBase = <T extends LayoutTag = "div">({ as, ...rest }: GridBaseProps<T>): ReactElement => {
  const Tag = (as ?? "div") as "div";
  return <Tag data-slot="grid" {...(rest as GridBaseProps<"div">)} />;
};

GridBase.displayName = "GridBase";
