import type { ComponentPropsWithRef } from "react";

export type SkeletonProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /** `text` a 12px line, `block` a box at the control radius, `circle` a disc; size it like the content it replaces. @default "text" */
  shape?: "text" | "block" | "circle";
};
