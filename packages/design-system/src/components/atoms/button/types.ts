import type { ButtonBaseProps } from "@scnx/core-ui/components/button-base";

export type ButtonProps = {
  /** Visual variant of the button. @default "primary" */
  variant?: "primary" | "secondary";
} & ButtonBaseProps;
