import type { ComponentPropsWithRef } from "react";

// Owned public variant types. Kept equal to `headingRecipe` in panda.config.ts
// by src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type HeadingVariants = {
  /** @default "xl" */
  size?: "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl" | "xl" | "lg" | "base" | "sm";
  /** @default "bold" */
  weight?: "bold" | "semibold" | "medium" | "regular" | "thin";
};

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p" | "div" | "label";

export type HeadingProps<T extends HeadingTag = "h2"> = {
  /** Semantic element to render. @default "h2" */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, "as" | "size" | "weight"> &
  HeadingVariants;
