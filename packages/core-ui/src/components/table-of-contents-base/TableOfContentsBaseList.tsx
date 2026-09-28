import type { ReactElement } from "react";
import type { TableOfContentsBaseListProps } from "./types";

/**
 * TableOfContentsBaseList - High-performance semantic list.
 * Restricted to <ul> for structural stability.
 */
export const TableOfContentsBaseList = ({ 
  children, 
  ...rest 
}: TableOfContentsBaseListProps): ReactElement => {
  return (
    <ul data-part="list" {...rest}>
      {children}
    </ul>
  );
};

TableOfContentsBaseList.displayName = "TableOfContentsBaseList";
