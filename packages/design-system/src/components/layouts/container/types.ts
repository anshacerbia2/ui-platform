import type { ContainerBaseProps, LayoutTag } from "@scnx/core-ui/components/container-base";

// Owned public variant types. Kept equal to `containerRecipe` in
// panda.config.ts by src/components/recipe-variants.test.ts; published
// declarations must not depend on generated Panda types.
export type ContainerVariants = {
  /** @default "base" */
  size?: "prose" | "base" | "wide" | "fluid";
};
export type ContainerProps<T extends LayoutTag = "div"> = ContainerBaseProps<T> & ContainerVariants;
