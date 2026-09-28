import type { As } from "../../types/polymorphic";
import type { TextBaseProps } from "./types";

/**
 * Headless typography primitive.
 * Optimized for 'Performance Maximality' via pure polymorphic 'as' prop.
 */
export const TextBase = <E extends As = "p">({ 
  as = "p" as E,
  ...props 
}: TextBaseProps<E>) => {
  const Component = (as || "p") as any;
  return <Component data-slot="text" {...props} />;
};

TextBase.displayName = "TextBase";
