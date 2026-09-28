import type { ReactElement } from "react";
import type { TableOfContentsBaseItemProps } from "./types";

/**
 * TableOfContentsBaseItem - High-performance semantic item.
 * Restricted to <li> for structural stability.
 */
export const TableOfContentsBaseItem = ({ 
  children, 
  ...rest 
}: TableOfContentsBaseItemProps): ReactElement => {
  return (
    <li data-part="item" {...rest}>
      {children}
    </li>
  );
};

TableOfContentsBaseItem.displayName = "TableOfContentsBaseItem";
