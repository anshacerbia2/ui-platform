import type { ClosedAsProps, HeadingTag } from "../../types/polymorphic";
import type { CollapsibleBaseItemProps, CollapsibleBaseRootProps } from "../collapsible-base/types";

export type AccordionType = "single" | "multiple";

/** An accordion: a disclosure scope that is single (one open item) by default. */
export type AccordionBaseRootProps = CollapsibleBaseRootProps;

export type AccordionBaseItemProps = CollapsibleBaseItemProps;

/** The heading around a trigger; `as` picks the level from {@link HeadingTag} (default `h3`). */
export type AccordionBaseHeaderProps<T extends HeadingTag = "h3"> = ClosedAsProps<T>;
