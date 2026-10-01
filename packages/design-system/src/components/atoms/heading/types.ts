import type { HeadingBaseProps, HeadingTag } from "@scnx/core-ui/components/heading-base";

// Owned public variant types. Kept equal to `headingRecipe` in panda.config.ts
// by src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type HeadingVariants = {
  /** @default "medium" */
  size?: "xxlarge" | "xlarge" | "large" | "medium" | "small" | "xsmall";
  /** @default "bold" */
  weight?: "bold" | "semibold" | "medium" | "regular";
};

export type { HeadingTag };

/** `as` picks the semantic level from the closed HeadingTag union (@default "h2"). */
export type HeadingProps<T extends HeadingTag = "h2"> = Omit<HeadingBaseProps<T>, "size" | "weight"> & HeadingVariants;
