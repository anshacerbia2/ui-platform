import type { ButtonBaseProps } from "@scnx/core-ui/components/button-base";

/**
 * An icon has no text, so an icon button needs a name: exactly one of
 * `aria-label` and `aria-labelledby` (as Primer's IconButton requires).
 */
export type IconButtonNameProps =
  | { "aria-label": string; "aria-labelledby"?: undefined }
  | { "aria-label"?: undefined; "aria-labelledby": string };

/** Button's variants; `ghost` has no fill at rest and takes the subtle neutral fill on hover. */
export type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** Button's heights as a square: `small` 28 px, `medium` 36 px, `large` 44 px. */
export type IconButtonSize = "small" | "medium" | "large";

/**
 * The outline. `circular` is a system variant for a shape that carries meaning
 * (a floating or avatar-like action); it stays round whatever the radius hook
 * or theme says.
 */
export type IconButtonShape = "square" | "circular";

/** Each member of a props union without its naming attributes, which {@link IconButtonNameProps} supplies. */
export type WithoutAccessibleName<T> = T extends unknown ? Omit<T, "aria-label" | "aria-labelledby"> : never;

export type IconButtonProps = IconButtonNameProps & {
  /** Visual variant. @default "secondary" */
  variant?: IconButtonVariant;
  /** Size. @default "medium" */
  size?: IconButtonSize;
  /** Shape. @default "square" */
  shape?: IconButtonShape;
} &WithoutAccessibleName<ButtonBaseProps>;
