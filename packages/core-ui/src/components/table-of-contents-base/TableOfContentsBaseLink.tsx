import type { MouseEvent, ReactElement } from "react";
import { Slot } from "../../utils/Slot";
import { useTableOfContents } from "./TableOfContentsContext";
import type { TableOfContentsBaseLinkProps } from "./types";

/**
 * TableOfContentsBaseLink - an in-page link to a heading (TDD primitives
 * P10). It points to `#<targetId>` and never takes the heading's ID (IDs
 * must be unique in a tree, WHATWG HTML). The active link carries
 * `aria-current="location"`. The consumer's onClick runs first;
 * `preventDefault` keeps the library from scrolling.
 */
export const TableOfContentsBaseLink = ({ targetId, asChild, children, onClick, ...rest }: TableOfContentsBaseLinkProps): ReactElement => {
  const { activeId, scrollTo } = useTableOfContents();
  const isActive = activeId === targetId;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    scrollTo(targetId);
  };
  const props = {
    ...rest,
    "data-part": "link",
    href: `#${targetId}`,
    "data-active": isActive || undefined,
    "aria-current": isActive ? ("location" as const) : undefined,
    onClick: handleClick,
  };
  if (asChild) return <Slot {...props}>{children as ReactElement}</Slot>;
  return <a {...props}>{children}</a>;
};

TableOfContentsBaseLink.displayName = "TableOfContentsBaseLink";
