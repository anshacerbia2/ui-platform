import { TextFieldBase } from "@scnx/core-ui/components/text-field-base";

import type { TextFieldProps } from "./types";
import { cx } from "styled-system/css";

// TDD styled TF3: the error line leads with a decorative icon; the message
// text alone names the error, so the icon is hidden from assistive technology.
const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

/**
 * Styled text field: a visible label, an optional hint, the input, and an
 * optional error message. Wraps `@scnx/core-ui/components/text-field-base`
 * (TDD primitives P15).
 *
 * @example
 * ```tsx
 * import { TextField } from "@scnx/system/components/text-field";
 *
 * <TextField label="Email" type="email" description="We send the payslip here." error={emailError} />
 * ```
 */
export const TextField = ({ className = "", error, ...rest }: TextFieldProps) => (
  <TextFieldBase
    {...rest}
    error={
      error != null ? (
        <>
          <ErrorIcon />
          {error}
        </>
      ) : undefined
    }
    className={cx("scnx-text-field", className)}
  />
);

TextField.displayName = "TextField";
