import type { ButtonBaseProps } from "@scnx/core-ui/components/button-base";

/**
 * `primary` is ink, the one most important action in a view; `secondary` is
 * the raised material; `ghost` has no fill at rest; `danger` confirms a
 * destructive action.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** `small` 28 px, `medium` 36 px, `large` 44 px. */
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = {
  /** Visual variant of the button. @default "primary" */
  variant?: ButtonVariant;
  /** Height of the button. @default "medium" */
  size?: ButtonSize;
} & ButtonBaseProps;
