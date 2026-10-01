import type {
  TextBaseProps
} from "@scnx/core-ui/components/text-base";
import type { ElementType } from "react";

// Owned public variant types. Kept equal to `textRecipe` in panda.config.ts by
// src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type TextVariants = {
  /** @default "body-default" */
  variant?: "body-large" | "body-default" | "body-small" | "label-default" | "label-small";
  /** Overrides the weight the variant's composite carries. */
  weight?: "bold" | "semibold" | "medium" | "regular";
  /** @default "left" */
  align?: "left" | "center" | "right";
  dimmed?: boolean;
};

/**
 * TextProps - Styled Typography Primitive.
 * Follows Tier 1 Governance for Polymorphic Primitives.
 */
export type TextProps<E extends ElementType = "p"> = TextBaseProps<E> & TextVariants;

export type { TextBaseProps };
