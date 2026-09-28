import type { FlexBaseProps } from "@scnx/core-ui/components/flex-base";
import type { RecipeVariantProps } from "styled-system/css";
import { flexRecipe } from "styled-system/recipes";

export type FlexVariants = Partial<RecipeVariantProps<typeof flexRecipe>>;

export type FlexProps = Omit<
  FlexBaseProps,
  "className" | "direction" | "align" | "justify" | "wrap" | "gap"
> &
  FlexVariants & {
    className?: string;
  };
