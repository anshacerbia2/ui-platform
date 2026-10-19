import { TextFieldBase } from "@scnx/core-ui/components/text-field-base";

import type { TextFieldProps } from "./types";
import { cx } from "styled-system/css";

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
export const TextField = ({ className = "", ...rest }: TextFieldProps) => <TextFieldBase {...rest} className={cx("scnx-text-field", className)} />;

TextField.displayName = "TextField";
