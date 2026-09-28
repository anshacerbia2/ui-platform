import { TableOfContentsBaseList } from "@scnx/core-ui/components/table-of-contents-base";

import type { TableOfContentsListProps } from "./types";
import { cx } from "styled-system/css";

/**
 * TableOfContentsList - Styled TOC list container.
 * Simplified structural component (fixed to <ul>).
 */
export const TableOfContentsList = ({ 
  className = "",
  ...rest 
}: TableOfContentsListProps) => {
  return (
    <TableOfContentsBaseList 
      className={cx("scnx-toc__list", className)} 
      {...rest}
    />
  );
};

TableOfContentsList.displayName = "TableOfContentsList";
