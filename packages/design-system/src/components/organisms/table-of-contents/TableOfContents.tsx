"use client";

import type { TableOfContentsProps } from "./types";
import { TableOfContentsRoot as Root } from "./TableOfContentsRoot";
import { TableOfContentsList as List } from "./TableOfContentsList";
import { TableOfContentsItem as Item } from "./TableOfContentsItem";
import { TableOfContentsLink as Link } from "./TableOfContentsLink";

/**
 * Compound wrapper for TableOfContents to support dot-notation.
 */
const TableOfContentsCompound = (props: TableOfContentsProps) => <Root {...props} />;

TableOfContentsCompound.displayName = "TableOfContents";

/**
 * TableOfContents - Tier 1 Organism Component.
 *
 * Styled table of contents component for page-level navigation.
 * Highly composable through structural slots (List, Item, Link).
 * Wraps `@scnx/core-ui/table-of-contents-base`.
 *
 * @example
 * ```tsx
 * import { TableOfContents } from "@scnx/system/table-of-contents";
 *
 * <TableOfContents items={docs.toc} />
 * ```
 * 
 * @example
 * ```tsx
 * <TableOfContents>
 *   <TableOfContents.List>
 *     <TableOfContents.Item>
 *       <TableOfContents.Link id="section-1">Section 1</TableOfContents.Link>
 *     </TableOfContents.Item>
 *   </TableOfContents.List>
 * </TableOfContents>
 * ```
 */
export const TableOfContents = Object.assign(TableOfContentsCompound, {
  List,
  Item,
  Link,
});
