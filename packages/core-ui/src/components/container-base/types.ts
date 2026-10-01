import type { ClosedAsProps, LayoutTag } from "../../types/polymorphic";

/** A page container; `as` picks one tag from {@link LayoutTag} (default `div`). */
export type ContainerBaseProps<T extends LayoutTag = "div"> = ClosedAsProps<T>;
