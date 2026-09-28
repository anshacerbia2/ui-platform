import type { ComponentPropsWithRef } from "react";

import type { RecipeVariantProps } from "styled-system/css";
import { headingRecipe } from "styled-system/recipes";

export type HeadingVariants = RecipeVariantProps<typeof headingRecipe>;

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p" | "div" | "label";

export type HeadingProps<T extends HeadingTag = "h2"> = {
  /** Semantic element to render. @default "h2" */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, "as" | "size" | "weight"> &
  Partial<HeadingVariants>;
