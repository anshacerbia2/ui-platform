import type { GridBaseProps } from "@scnx/core-ui/components/grid-base";
import type { RecipeVariantProps } from "styled-system/css";
import { gridRecipe } from "styled-system/recipes";

export type GridVariants = Partial<RecipeVariantProps<typeof gridRecipe>>;

export type GridProps = Omit<
  GridBaseProps,
  "className" | "columns" | "gap" | "rows" | "flow"
> &
  GridVariants & {
    className?: string;
  };
