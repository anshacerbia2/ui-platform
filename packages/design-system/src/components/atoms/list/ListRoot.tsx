import { ListBaseRoot } from "@scnx/core-ui/components/list-base";
import { listRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";
import type { ListProps } from "./types";

/**
 * List root. `variant="ordered"` renders `ol`. The `unstyled` variant removes
 * the markers, which makes Safari/VoiceOver drop list semantics outside a
 * `nav`, so it adds `role="list"` (TDD primitives P9).
 */
export const ListRoot = ({ variant, spacing, className, type, ...props }: ListProps) => {
  const recipeClass = listRecipe({ variant, spacing });
  return (
    <ListBaseRoot
      type={type ?? (variant === "ordered" ? "ordered" : "unordered")}
      role={variant === "unstyled" ? "list" : undefined}
      className={cx(recipeClass, className)}
      {...props}
    />
  );
};

ListRoot.displayName = "ListRoot";
