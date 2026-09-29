import type { ReactElement } from "react";
import type { ButtonBaseProps } from "./types";

/**
 * ButtonBase - Headless button component that automatically toggles between
 * `<button>` and `<a>` elements based on the presence of an `href` prop.
 * 
 * Supports both button and anchor behaviors with a unified API.
 * Follows React 19 standards (ref via ...rest).
 *
 * @example
 * ```tsx
 * import { ButtonBase } from "@scnx/core-ui/components/button-base";
 * 
 * // Renders as <button>
 * <ButtonBase onClick={() => console.log('clicked')}>
 *   Default Actions
 * </ButtonBase>
 * 
 * // Renders as <a>
 * <ButtonBase href="https://example.com" target="_blank">
 *   External Link
 * </ButtonBase>
 * ```
 */
export const ButtonBase = ({
    children,
    className,
    disabled = false,
    pressed,
    ...rest
  }: ButtonBaseProps): ReactElement => {
  // Anchor mode
  if ("href" in rest && rest.href) {
    const { href, onClick, ...anchorRest } = rest as any;

    const handleClick = (e: any) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    return (
      <a
        className={className}
        href={disabled ? undefined : href}
        role="button"
        aria-disabled={disabled || undefined}
        onClick={handleClick}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  // Button mode
  const { type = "button", ...buttonRest } = rest as any;

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      aria-pressed={typeof pressed === "boolean" ? pressed : undefined}
      {...buttonRest}
    >
      {children}
    </button>
  );
};

ButtonBase.displayName = "ButtonBase";
