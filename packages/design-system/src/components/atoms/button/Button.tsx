import { ButtonBase, type ButtonBaseProps } from "@scnx/core-ui/components/button-base";

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
  // Destructuring a union loses its discriminant; the props are still one
  // ButtonBase mode, which ButtonBase discriminates at runtime.
  return <ButtonBase {...(rest as ButtonBaseProps)} className={cx("scnx-btn", className)} data-variant={variant} />;
};

Button.displayName = "Button";
