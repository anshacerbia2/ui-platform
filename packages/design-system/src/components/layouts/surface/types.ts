import type { BoxBaseProps, LayoutTag } from "@scnx/core-ui/components/box-base";

/** The on-page materials (ADR-UIP-VIS-001 item 1); floating materials stay with their overlay components. */
export type SurfaceMaterial = "flat" | "raised" | "panel" | "well";

/** Inset padding: `compact` 8px, `default` 16px, `comfortable` 24px in the default theme. */
export type SurfacePadding = "none" | "compact" | "default" | "comfortable";

export type SurfaceProps<T extends LayoutTag = "div"> = BoxBaseProps<T> & {
  /** The material: fill, radius, and edge as one set. @default "raised" */
  material?: SurfaceMaterial;
  /** The inset padding. @default "none" */
  padding?: SurfacePadding;
};
