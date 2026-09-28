import type { ElementType } from "react";
import { TableOfContentsBaseLink } from "@scnx/core-ui/components/table-of-contents-base";

import type { TableOfContentsLinkProps } from "./types";
import { cx } from "styled-system/css";

/**
 * TableOfContentsLink - Styled TOC link.
 * Uses the expert 'as' prop pattern for maximum router compatibility.
 */
export const TableOfContentsLink = <E extends ElementType = "a">({ 
  className = "",
  ...rest 
}: TableOfContentsLinkProps<E>) => {
  return (
    <TableOfContentsBaseLink
      className={cx("scnx-toc__link", className)}
      {...(rest as any)}
    />
  );
};

TableOfContentsLink.displayName = "TableOfContentsLink";
