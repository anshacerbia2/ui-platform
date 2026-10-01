import type { TextBaseProps, TextTag } from "@scnx/core-ui/components/text-base";

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
export type TextProps<T extends TextTag = "p"> = Omit<TextBaseProps<T>, keyof TextVariants> & TextVariants;

export type { TextBaseProps, TextTag };
