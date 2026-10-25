import type { RadioGroupBaseItemProps, RadioGroupBaseProps } from "@scnx/core-ui/components/radio-group-base";

/** `medium` is a 36px well of 28px segments; `small` a 32px well of 24px segments (the target floor). */
export type SegmentedControlSize = "small" | "medium";

export type SegmentedControlProps = RadioGroupBaseProps & {
  /** Size. @default "medium" */
  size?: SegmentedControlSize;
};

/** One segment: text, or an icon marked `aria-hidden` with `aria-label` on the segment. */
export type SegmentedControlItemProps = RadioGroupBaseItemProps;
