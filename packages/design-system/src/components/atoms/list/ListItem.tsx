import { ListBaseItem } from "@scnx/core-ui/components/list-base";
import { listItemRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";
import type { ListItemProps } from "./types";

/**
 * ListItem - Atomic list entry component.
 */
export const ListItem = ({ className, ...props }: ListItemProps) => {
  const recipeClass = listItemRecipe();
  
  return (
    <ListBaseItem 
      className={cx(recipeClass, className)} 
      {...props} 
    />
  );
};

ListItem.displayName = "ListItem";
