"use client";

import "./TableOfContents.scss";
import type { ReactNode } from "react";
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
const renderTocItems = (
  items: TableOfContentsItemState[], 
  LinkComponent: any = "a", 
  linkProps: any = {}
): ReactNode => {
  if (!items || items.length === 0) return null;
  console.log(items,"ASU")
  return (
    <List>
      {items.map((item) => (
        <Item key={item.id}>
          {/* Injecting LinkComponent directly as the rendered component */}
          <Link id={item.id} as={LinkComponent} {...linkProps}>
            {item.title}
          </Link>
          {item.subcontent && item.subcontent?.length > 0 && 
            renderTocItems(item.subcontent, LinkComponent, linkProps)}
        </Item>
      ))}
    </List>
  );
};

/**
 * Root container for the Table of Contents.
 * Manages active section tracking via intersection observer.
 * 
 * @example
 * <TableOfContents 
 *   items={docs.toc} 
 *   linkAs={Link} 
 *   linkProps={{ prefetch: false }} 
 * />
 */
export const TableOfContentsRoot = ({ 
  children,
  className = "", 
  items = [],
  linkAs,
  linkProps,
  ...rest 
}: TableOfContentsProps) => {
  const hasItems = items.length > 0;

  return (
    <TableOfContentsBaseRoot
      className={cx("scnx-toc", className)}
      items={items}
      {...rest}
    >
      {hasItems && <div className="scnx-toc__label">Contents</div>}
      {children || (hasItems && renderTocItems(items, linkAs, linkProps))}
    </TableOfContentsBaseRoot>
  );
};

TableOfContentsRoot.displayName = "TableOfContentsRoot";
