import { ButtonBase } from "@scnx/core-ui/components/button-base";
import "./Button.scss";

import type { ButtonProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Styled button component for user interaction. Wraps `@scnx/core-ui/components/button-base`.
 * Renders a semantic `<button>` or `<a>` element based on props.
 *
 * @example
 * ```tsx
 * import { Button } from "@scnx/system/components/button";
 *
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Click Me
 * </Button>
 * 
 * <Button variant="secondary" href="https://google.com">
 *   Go to Google
 * </Button>
 * ```
 */
export const Button = ({
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) => {
  // Cast needed: ButtonBase uses function overloads (ButtonMode | AnchorMode)
  // that TS can't resolve from a union type. Runtime discrimination is safe.
  return (
    <ButtonBase
      className={cx("scnx-btn", className)}
      data-variant={variant}
      {...(rest as any)}
    />
  );
};

Button.displayName = "Button";
