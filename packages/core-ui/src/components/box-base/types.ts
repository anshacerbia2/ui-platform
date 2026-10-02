import type { ClosedAsProps, LayoutTag } from "../../types/polymorphic";

/** A layout element; `as` picks one tag from {@link LayoutTag} (default `div`). */
export type BoxBaseProps<T extends LayoutTag = "div"> = ClosedAsProps<T>;
