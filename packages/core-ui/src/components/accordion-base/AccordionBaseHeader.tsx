import type { ReactElement } from "react";
import type { HeadingTag } from "../../types/polymorphic";
import type { AccordionBaseHeaderProps } from "./types";

/**
 * AccordionBaseHeader - the heading that wraps an accordion trigger, `h3` by
 * default (TDD primitives P5; WAI-ARIA APG Accordion: the header button "is
 * wrapped in an element with role heading"). Choose the level that fits the
 * page outline with `as`.
 */
export const AccordionBaseHeader = <T extends HeadingTag = "h3">({ as, ...rest }: AccordionBaseHeaderProps<T>): ReactElement => {
  const Tag = (as ?? "h3") as "h3";
  return <Tag data-part="header" {...(rest as AccordionBaseHeaderProps<"h3">)} />;
};

AccordionBaseHeader.displayName = "AccordionBaseHeader";
