import type { ElementType } from "react";
import type { ContainerBaseProps } from "@scnx/core-ui/components/container-base";
import type { RecipeVariantProps } from "styled-system/css";
import { containerRecipe } from "styled-system/recipes";

export type ContainerVariants = Partial<RecipeVariantProps<typeof containerRecipe>>;
export type ContainerProps<E extends ElementType = "div"> = ContainerBaseProps<E> & ContainerVariants;
