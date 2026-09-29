import type { ElementType } from "react";
import type { ContainerBaseProps } from "@scnx/core-ui/components/container-base";

// Owned public variant types. Kept equal to `containerRecipe` in
// panda.config.ts by src/components/recipe-variants.test.ts; published
// declarations must not depend on generated Panda types.
export type ContainerVariants = {
  /** @default "base" */
  size?: "prose" | "base" | "wide" | "fluid";
};
export type ContainerProps<E extends ElementType = "div"> = ContainerBaseProps<E> & ContainerVariants;
