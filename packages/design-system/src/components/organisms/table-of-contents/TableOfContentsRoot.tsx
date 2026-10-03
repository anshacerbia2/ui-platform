import { useId, type ReactNode } from "react";
import { TableOfContentsBaseRoot } from "@scnx/core-ui/components/table-of-contents-base";

import type { TableOfContentsProps, TableOfContentsItemState } from "./types";
import { cx } from "styled-system/css";
import { TableOfContentsList as List } from "./TableOfContentsList";
import { TableOfContentsItem as Item } from "./TableOfContentsItem";
import { TableOfContentsLink as Link } from "./TableOfContentsLink";

/**
 * Recursive renderer for TOC items with component injection support.
 * Uses the expert 'as' prop pattern for clean, functional injection.
 */
const renderTocItems = (items: TableOfContentsItemState[]): ReactNode => {
  if (!items || items.length === 0) return null;
  return (
    <List>
      {items.map((item) => (
        <Item key={item.id}>
          <Link targetId={item.id}>
            {item.title}
          </Link>
          {item.subcontent && item.subcontent?.length > 0 && 
            renderTocItems(item.subcontent)}
        </Item>
      ))}
    </List>
  );
};

/**
 * Root container for the Table of Contents.
 * Manages active section tracking via intersection observer.
 * 
 * Items name their target headings by `id`; each link points to `#<id>`
 * and keeps its own distinct ID (TDD primitives P10). `label` is the visible
 * label and accessible name.
 *
 * @example
 * <TableOfContents items={docs.toc} label="On this page" />
 */
export const TableOfContentsRoot = ({ 
  children,
  className = "", 
  items = [],
  label = "Contents",
  ...rest 
}: TableOfContentsProps) => {
  const labelId = `${useId()}-label`;
  const hasItems = items.length > 0;

  return (
    <TableOfContentsBaseRoot
      className={cx("scnx-toc", className)}
      items={items}
      aria-labelledby={hasItems ? labelId : undefined}
      {...rest}
    >
      {hasItems && <div id={labelId} className="scnx-toc__label">{label}</div>}
      {children || (hasItems && renderTocItems(items))}
    </TableOfContentsBaseRoot>
  );
};

TableOfContentsRoot.displayName = "TableOfContentsRoot";
