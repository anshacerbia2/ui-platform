import { ListRoot } from "./ListRoot";
import { ListItem } from "./ListItem";
import type { ListProps } from "./types";

const ListCompound = ({ ...rest }: ListProps) => <ListRoot {...rest} />;
ListCompound.displayName = "List";

/**
 * List - Namespaced Compound Component.
 * 
 * Provides a clean API for standard usage while maintaining 
 * tree-shakable underlying primitives.
 */
export const List = Object.assign(ListCompound, {
  Root: ListRoot, // Explicit root access for composition
  Item: ListItem,
});
