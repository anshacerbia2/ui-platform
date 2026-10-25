import type { ComponentPropsWithRef, ReactNode } from "react";

export type RadioGroupSelection =
  | {
      /** The checked item's value (controlled). */
      value: string;
      /** Called with the value of the item the user checks. */
      onValueChange: (value: string) => void;
      defaultValue?: never;
    }
  | {
      /** The initially checked item's value (uncontrolled); none is checked without it. */
      defaultValue?: string;
      onValueChange?: (value: string) => void;
      value?: never;
    };

/**
 * A radio group names itself: exactly one of `aria-label` and
 * `aria-labelledby`, as WAI-ARIA requires of a `radiogroup`.
 */
export type RadioGroupNameProps =
  | { "aria-label": string; "aria-labelledby"?: undefined }
  | { "aria-label"?: undefined; "aria-labelledby": string };

export type RadioGroupBaseProps = RadioGroupSelection &
  RadioGroupNameProps & {
    /** The radios' shared `name`; defaults to a generated one, so the browser groups them. */
    name?: string;
    /** Disables every item. @default false */
    disabled?: boolean;
    /** The group takes part in form validation: one item must be checked. @default false */
    required?: boolean;
    children?: ReactNode;
  } & Omit<ComponentPropsWithRef<"div">, "role" | "onChange" | "defaultValue" | "aria-label" | "aria-labelledby" | "children">;

export type RadioGroupBaseItemProps = {
  /** The value this item checks. */
  value: string;
  /** Disables this item; arrow keys skip it. @default false */
  disabled?: boolean;
  /** The item's label: text, or an icon marked `aria-hidden` with `aria-label` on the item. */
  children?: ReactNode;
  /** The radio's accessible name when the item shows no text (an icon); it names the input, not the label. */
  "aria-label"?: string;
} & Omit<ComponentPropsWithRef<"label">, "children" | "htmlFor" | "aria-label">;
