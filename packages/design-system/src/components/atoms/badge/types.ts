import type { BadgeBaseProps } from "@scnx/core-ui/components/badge-base";

/** The color scheme of a badge, one of the token schemes (STD-UIP-TKN-001). */
export type BadgeScheme = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

/** `subtle` is a tinted fill under the scheme's low-contrast text; `solid` is the scheme's solid fill under its contrast label. */
export type BadgeEmphasis = "subtle" | "solid";

export type BadgeSize = "small" | "medium";

export type BadgeProps = {
  /** Color scheme. @default "neutral" */
  scheme?: BadgeScheme;
  /** Fill emphasis. @default "subtle" */
  emphasis?: BadgeEmphasis;
  /** Size. @default "medium" */
  size?: BadgeSize;
  /** A leading dot in the text color for a live status ("Live", "Failed"); decorative, so the word still names the status. @default false */
  dot?: boolean;
} & BadgeBaseProps;
