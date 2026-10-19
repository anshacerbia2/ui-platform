import { useId, type ReactElement } from "react";
import type { TextFieldBaseProps } from "./types";

/**
 * TextFieldBase - a labelled text input with an optional description and
 * error message (TDD primitives P15).
 *
 * Renders, in order, a native `<label>`, the description, the `<input>`, and
 * the error. The description and error ids derive from the input id and are
 * listed in `aria-describedby`; an error sets `aria-invalid="true"`. Keyboard
 * and focus are the native input's.
 *
 * @example
 * ```tsx
 * <TextFieldBase label="Email" type="email" description="We send the payslip here." error={emailError} />
 * ```
 */
export const TextFieldBase = ({ label, description, error, id: idProp, type = "text", className, disabled, required, ...rest }: TextFieldBaseProps): ReactElement => {
  const generated = useId();
  const id = idProp ?? generated;
  const descriptionId = description != null ? `${id}-description` : undefined;
  const errorId = error != null ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className} data-invalid={errorId ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <label htmlFor={id} data-part="label">
        {label}
      </label>
      {descriptionId && (
        <p id={descriptionId} data-part="description">
          {description}
        </p>
      )}
      <input
        {...rest}
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={errorId ? true : undefined}
        data-part="input"
      />
      {errorId && (
        <p id={errorId} data-part="error">
          {error}
        </p>
      )}
    </div>
  );
};

TextFieldBase.displayName = "TextFieldBase";
