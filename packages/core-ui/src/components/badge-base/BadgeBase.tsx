import type { ReactElement } from "react";
import type { BadgeBaseProps } from "./types";

/**
 * BadgeBase - a short, non-interactive label (TDD primitives P25).
 *
 * Renders one `<span>` with no role: a badge's text is its meaning, read in
 * place by assistive technology, and color is never its only cue.
 *
 * @example
 * ```tsx
 * <BadgeBase>Beta</BadgeBase>
 * ```
 */
export const BadgeBase = (props: BadgeBaseProps): ReactElement => <span {...props} />;

BadgeBase.displayName = "BadgeBase";
