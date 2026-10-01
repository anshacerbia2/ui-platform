import type { ClosedAsProps, HeadingTag } from "../../types/polymorphic";

/** A heading; `as` picks one tag from {@link HeadingTag} (default `h2`). */
export type HeadingBaseProps<T extends HeadingTag = "h2"> = ClosedAsProps<T>;
