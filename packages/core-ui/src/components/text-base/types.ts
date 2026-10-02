import type { ClosedAsProps, TextTag } from "../../types/polymorphic";

/** Text; `as` picks one tag from {@link TextTag} (default `p`). */
export type TextBaseProps<T extends TextTag = "p"> = ClosedAsProps<T>;
