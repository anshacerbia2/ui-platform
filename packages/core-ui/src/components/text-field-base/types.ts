import type { ComponentPropsWithRef, ReactNode } from "react";

/** Text-like input types (TDD primitives P15); `number` is excluded, use `inputMode`. */
export type TextFieldBaseType = "text" | "email" | "password" | "search" | "tel" | "url";

export type TextFieldBaseProps = Omit<ComponentPropsWithRef<"input">, "type" | "children" | "className" | "aria-describedby" | "aria-invalid"> & {
  /** Visible label, rendered as a native `<label>` for the input. Required: a placeholder is never the label. */
  label: ReactNode;
  /** Hint or instructions, associated with the input by `aria-describedby`. */
  description?: ReactNode;
  /** Error message. When present the input has `aria-invalid="true"` and the message is associated by `aria-describedby`. */
  error?: ReactNode;
  /** The input id; defaults to a generated one. The description and error ids derive from it. */
  id?: string;
  /** Text-like input type. Defaults to `text`. */
  type?: TextFieldBaseType;
  /** Class of the root element. */
  className?: string;
};
