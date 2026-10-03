import type { ReactElement } from "react";
import { useMemo, useState, useCallback, useEffect } from "react";

import { TableOfContentsContext } from "./TableOfContentsContext";
import { useTableOfContentsTracker } from "./useTableOfContentsTracker";
import type {
  TableOfContentsBaseRootProps,
  TableOfContentsItemState,
} from "./types";

/**
 * TableOfContentsBaseRoot - Pure headless logic for Table of Contents.
 * Manages active section state and item registration.
 * 
 * @example
 * <TableOfContentsBaseRoot items={[...]}>
 *   <TableOfContentsBaseList>...</TableOfContentsBaseList>
 * </TableOfContentsBaseRoot>
 */
export const TableOfContentsBaseRoot = ({
  children,
  items: initialItems = [],
  scrollOffsetExtended = 36,
  navbarOffset,
  ...rest
}: TableOfContentsBaseRootProps): ReactElement => {
  const [items, setItems] = useState<TableOfContentsItemState[]>(initialItems);

  // Sync prop changes to state (Next.js / Hydration safety)
  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Fire up the tracking engine
  const { activeId, scrollTo } = useTableOfContentsTracker({
    items,
    scrollOffsetExtended,
    navbarOffset,
  });

  const registerItem = useCallback((item: TableOfContentsItemState) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    activeId,
    items,
    registerItem,
    unregisterItem,
    scrollTo,
  }), [activeId, items, registerItem, unregisterItem, scrollTo]);

  return (
    <TableOfContentsContext value={contextValue}>
      <nav data-part="root" {...rest}>
        {children}
      </nav>
    </TableOfContentsContext>
  );
};

TableOfContentsBaseRoot.displayName = "TableOfContentsBaseRoot";
