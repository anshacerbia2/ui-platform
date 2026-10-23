import { BadgeBase } from "@scnx/core-ui/components/badge-base";

import type { BadgeProps } from "./types";
import { cx } from "styled-system/css";

/**
 * A short, non-interactive label for a status or a category. Wraps
 * `@scnx/core-ui/components/badge-base`; the text carries the meaning, and
 * the scheme only reinforces it.
 *
 * @example
 * ```tsx
 * import { Badge } from "@scnx/system/components/badge";
 *
 * <Badge scheme="success">Live</Badge>
 * <Badge scheme="danger" emphasis="solid" size="small">Failed</Badge>
 * ```
 */
export const Badge = ({ scheme = "neutral", emphasis = "subtle", size = "medium", className = "", ...rest }: BadgeProps) => (
  <BadgeBase {...rest} className={cx("scnx-badge", className)} data-scheme={scheme} data-emphasis={emphasis} data-size={size} />
);

Badge.displayName = "Badge";
