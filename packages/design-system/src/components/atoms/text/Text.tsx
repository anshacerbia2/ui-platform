import { type ElementType } from "react";
import { TextBase } from "@scnx/core-ui/components/text-base";

import type { TextProps } from "./types";
import { textRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Styled Typography Primitive.
 * Powered by Panda CSS and Core-UI TextBase.
 */
export const Text = <E extends ElementType = "p">({ 
  as,
  variant, 
  weight, 
  align, 
  dimmed, 
  className,
  ...props 
}: TextProps<E>) => {
  const recipeClass = textRecipe({ variant, weight, align, dimmed });
  
  return (
    <TextBase 
      as={as as any}
      className={cx(recipeClass, className)} 
      {...props} 
    />
  );
};

Text.displayName = "Text";
