import type { 
  TextBaseProps 
} from "@scnx/core-ui/components/text-base";
import type { ElementType } from "react";

import type { RecipeVariantProps } from "styled-system/types";
import type { textRecipe } from "styled-system/recipes";

export type TextVariants = RecipeVariantProps<typeof textRecipe>;

/**
 * TextProps - Styled Typography Primitive.
 * Follows Tier 1 Governance for Polymorphic Primitives.
 */
export type TextProps<E extends ElementType = "p"> = TextBaseProps<E> & Partial<TextVariants>;

export type { TextBaseProps };
