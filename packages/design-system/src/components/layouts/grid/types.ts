import type { GridBaseProps } from "@scnx/core-ui/components/grid-base";

// Owned public variant types. Kept equal to `gridRecipe` in panda.config.ts by
// src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type GridVariants = {
  /** @default "1" */
  columns?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
  /** @default "0" */
  gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16";
};

export type GridProps = Omit<
  GridBaseProps,
  "className" | "columns" | "gap" | "rows" | "flow"
> &
  GridVariants & {
    className?: string;
  };
