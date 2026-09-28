import { ListBaseRoot } from "@scnx/core-ui/components/list-base";
import { listRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";
import type { ListProps } from "./types";

/**
 * ListRoot - Foundational collection primitive.
 * Safely handles semantic toggle between <ul> and <ol>.
 */
export const ListRoot = ({ 
  variant, 
  spacing, 
  className,
  ...props 
}: ListProps) => {
  const recipeClass = listRecipe({ variant, spacing });
  
  return (
    <ListBaseRoot 
      className={cx(recipeClass, className)} 
      {...props} 
    />
  );
};

ListRoot.displayName = "ListRoot";
