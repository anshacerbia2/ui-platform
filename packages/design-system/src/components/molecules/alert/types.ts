import type { AlertBaseProps } from "@scnx/core-ui/components/alert-base";

/** The color scheme of an alert. */
export type AlertScheme = "neutral" | "info" | "success" | "warning" | "danger";

export type AlertProps = {
  /** Color scheme. @default "info" */
  scheme?: AlertScheme;
} & AlertBaseProps;
