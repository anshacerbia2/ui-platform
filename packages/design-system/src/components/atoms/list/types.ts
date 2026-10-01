import type {
  ListBaseRootProps,
  ListBaseItemProps
} from "@scnx/core-ui/components/list-base";

// Owned public variant types. Kept equal to `listRecipe` in panda.config.ts by
// src/components/recipe-variants.test.ts; published declarations must not
// depend on generated Panda types.
export type ListVariants = {
  /** @default "unordered" */
  variant?: "unordered" | "ordered" | "unstyled";
  /** @default "compact" */
  spacing?: "compact" | "default" | "comfortable";
};

export type ListProps = ListBaseRootProps & ListVariants & {
  className?: string;
};

export type ListItemProps = ListBaseItemProps & {
  className?: string;
};
