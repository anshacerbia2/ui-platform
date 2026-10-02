import { TextBase, type TextBaseProps } from "@scnx/core-ui/components/text-base";

import type { TextProps, TextTag } from "./types";
import { textRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Styled Typography Primitive.
 * Powered by Panda CSS and Core-UI TextBase.
 */
export const Text = <T extends TextTag = "p">({ 
  as,
  variant, 
  weight, 
  align, 
  dimmed, 
  className,
  ...props 
}: TextProps<T>) => {
  const recipeClass = textRecipe({ variant, weight, align, dimmed });
  
  return (
    <TextBase<T> {...(props as unknown as TextBaseProps<T>)} as={as} className={cx(recipeClass, className)} />
  );
};

Text.displayName = "Text";
