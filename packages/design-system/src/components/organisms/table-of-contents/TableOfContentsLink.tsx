import { TableOfContentsBaseLink } from "@scnx/core-ui/components/table-of-contents-base";

import type { TableOfContentsLinkProps } from "./types";
import { cx } from "styled-system/css";

/**
 * TableOfContentsLink - Styled TOC link.
 * Uses the expert 'as' prop pattern for maximum router compatibility.
 */
export const TableOfContentsLink = ({ 
  className = "",
  ...rest 
}: TableOfContentsLinkProps) => {
  return (
    <TableOfContentsBaseLink
      className={cx("scnx-toc__link", className)}
      {...rest}
    />
  );
};

TableOfContentsLink.displayName = "TableOfContentsLink";
