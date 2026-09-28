import type { TableOfContentsBaseRootProps } from "./types";
import { TableOfContentsBaseRoot as Root } from "./TableOfContentsBaseRoot";
import { TableOfContentsBaseList as List } from "./TableOfContentsBaseList";
import { TableOfContentsBaseItem as Item } from "./TableOfContentsBaseItem";
import { TableOfContentsBaseLink as Link } from "./TableOfContentsBaseLink";

const TableOfContentsBaseCompound = ({ ...rest }: TableOfContentsBaseRootProps) => <Root {...rest} />;
TableOfContentsBaseCompound.displayName = "TableOfContentsBase";

/**
 * TableOfContentsBase - Professional Headless Table of Contents system.
 * 
 * Coordinates active section tracking and smooth scrolling navigation.
 *
 * @example
 * ```tsx
 * import { TableOfContentsBase } from "@scnx/core-ui";
 * 
 * <TableOfContentsBase>
 *   <TableOfContentsBase.List>
 *     <TableOfContentsBase.Item>
 *       <TableOfContentsBase.Link id="intro">Introduction</TableOfContentsBase.Link>
 *     </TableOfContentsBase.Item>
 *   </TableOfContentsBase.List>
 * </TableOfContentsBase>
 * ```
 */
export const TableOfContentsBase = Object.assign(TableOfContentsBaseCompound, {
  Root,
  List,
  Item,
  Link,
});
