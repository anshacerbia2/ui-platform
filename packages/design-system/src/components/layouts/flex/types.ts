import type { FlexBaseProps } from "@scnx/core-ui/components/flex-base";

// Owned public variant types. Kept equal to `flexRecipe` in panda.config.ts by
// src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type FlexVariants = {
  /** @default "row" */
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  /** @default "start" */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** @default "start" */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  /** @default "nowrap" */
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  /** @default "0" */
  gap?: "none" | "compact" | "default" | "comfortable" | "section";
};

export type FlexProps = Omit<
  FlexBaseProps,
  "className" | "direction" | "align" | "justify" | "wrap" | "gap"
> &
  FlexVariants & {
    className?: string;
  };
