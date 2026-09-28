import { TableOfContentsBaseItem } from "@scnx/core-ui/components/table-of-contents-base";

import type { TableOfContentsItemProps } from "./types";
import { cx } from "styled-system/css";

/**
 * TableOfContentsItem - Styled TOC item container.
 * Simplified structural component (fixed to <li>).
 */
export const TableOfContentsItem = ({ 
  className = "",
  ...rest 
}: TableOfContentsItemProps) => {
  return (
    <TableOfContentsBaseItem 
      className={cx("scnx-toc__item", className)} 
      {...rest}
    />
  );
};

TableOfContentsItem.displayName = "TableOfContentsItem";
