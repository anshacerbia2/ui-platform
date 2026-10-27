import type { ComponentPropsWithRef } from "react";

export type SpinnerProps = Omit<ComponentPropsWithRef<"span">, "children" | "role"> & {
  /** What is loading, announced politely; omit it inside a control whose own label says so, and the spinner is hidden from assistive technology. */
  label?: string;
  /** `small` 16px, `medium` 20px, `large` 36px. @default "small" */
  size?: "small" | "medium" | "large";
};
