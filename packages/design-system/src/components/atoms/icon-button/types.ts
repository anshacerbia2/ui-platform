import type { ButtonBaseProps } from "@scnx/core-ui/components/button-base";

/**
 * An icon has no text, so an icon button needs a name: exactly one of
 * `aria-label` and `aria-labelledby` (as Primer's IconButton requires).
 */
export type IconButtonNameProps =
  | { "aria-label": string; "aria-labelledby"?: undefined }
  | { "aria-label"?: undefined; "aria-labelledby": string };

/** `ghost` has no fill at rest and takes the subtle neutral fill on hover. */
export type IconButtonVariant = "primary" | "secondary" | "ghost";

/** `small` is 24 px square, the WCAG 2.2 SC 2.5.8 minimum target; `medium` is 32 px. */
export type IconButtonSize = "small" | "medium";

/** Each member of a props union without its naming attributes, which {@link IconButtonNameProps} supplies. */
export type WithoutAccessibleName<T> = T extends unknown ? Omit<T, "aria-label" | "aria-labelledby"> : never;

export type IconButtonProps = IconButtonNameProps & {
  /** Visual variant. @default "secondary" */
  variant?: IconButtonVariant;
  /** Size. @default "medium" */
  size?: IconButtonSize;
} & WithoutAccessibleName<ButtonBaseProps>;
