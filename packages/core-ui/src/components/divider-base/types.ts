import type { ComponentPropsWithRef } from "react";

export type DividerOrientation = "horizontal" | "vertical";

export type DividerWeight = "thin" | "normal" | "thick";

export type DividerColor = "default" | "muted" | "primary";

export type DividerBaseProps = {
  /** Custom CSS classes. */
  className?: string;
  /** Color semantic for the divider. @default "default" */
  color?: DividerColor;
  /** Orientation of the divider. @default "horizontal" */
  orientation?: DividerOrientation;
  /** Weight/thickness of the divider. @default "normal" */
  weight?: DividerWeight;
} & Omit<ComponentPropsWithRef<"div">, "orientation" | "ref" | "color">;
