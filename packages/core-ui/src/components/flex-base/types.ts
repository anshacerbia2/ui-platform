import type { ClosedAsProps, LayoutTag } from "../../types/polymorphic";
export type FlexDirection = "row" | "col" | "row-reverse" | "col-reverse";

/** A layout element; `as` picks one tag from {@link LayoutTag} (default `div`). */
export type FlexBaseProps<T extends LayoutTag = "div"> = ClosedAsProps<T>;
