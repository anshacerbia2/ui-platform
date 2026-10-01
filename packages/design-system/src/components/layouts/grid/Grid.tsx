import { GridBase } from "@scnx/core-ui/components/grid-base";

import type { GridProps } from "./types";
import { gridRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Grid - Tier 1 Layout Component.
 * 
 * Styled grid container utilizing the Enterprise Layout System.
 * Wraps `@scnx/core-ui/components/grid-base` and injects `gridRecipe` spacing macros.
 *
 * @example
 * ```tsx
 * import { Grid } from "@scnx/system/components/grid";
 * 
 * <Grid columns="3" gap="comfortable">
 *   <p>Item 1</p>
 *   <p>Item 2</p>
 *   <p>Item 3</p>
 * </Grid>
 * ```
 */
export const Grid = ({
  columns,
  gap,
  className = "",
  ...rest
}: GridProps) => {
  const recipeClass = gridRecipe({ columns, gap });

  return <GridBase className={cx(recipeClass, className)} {...rest} />;
};

Grid.displayName = "Grid";
