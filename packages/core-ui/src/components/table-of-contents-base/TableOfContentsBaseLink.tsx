import type { ElementType, MouseEvent, ReactElement } from "react";

import type { TableOfContentsBaseLinkProps } from "./types";
import { useTableOfContents } from "./TableOfContentsContext";

/**
 * TableOfContentsBaseLink - High-performance link component.
 * Uses the expert 'as' prop pattern for React 19.
 */
export const TableOfContentsBaseLink = <E extends ElementType = "a">({ 
  as,
  children, 
  id,
  onClick,
  ...rest 
}: TableOfContentsBaseLinkProps<E>): ReactElement => {
  const { activeId, scrollTo } = useTableOfContents();
  const isActive = activeId === id;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // 1. Give users priority to handle/prevent the event
    if (onClick) onClick(e);
    
    // 2. Optimization: If user called e.preventDefault(), we skip the internal scroll
    if (e.defaultPrevented) return;

    // 3. Native scroll tracking
    if (id) scrollTo(id);
  };

  const Component = as || "a";

  return (
    <Component 
      data-part="link"
      id={id}
      href={id ? `#${id}` : undefined}
      data-active={isActive || undefined}
      aria-current={isActive ? "location" : undefined}
      onClick={handleClick}
      {...(rest as any)}
    >
      {children}
    </Component>
  );
};

TableOfContentsBaseLink.displayName = "TableOfContentsBaseLink";
