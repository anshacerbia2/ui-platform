import type { 
  ListBaseRootProps, 
  ListBaseItemProps 
} from "@scnx/core-ui/components/list-base";

import type { RecipeVariantProps } from "styled-system/types";
import type { listRecipe } from "styled-system/recipes";

export type ListVariants = RecipeVariantProps<typeof listRecipe>;

export type ListProps = ListBaseRootProps & ListVariants & {
  className?: string;
};

export type ListItemProps = ListBaseItemProps & {
  className?: string;
};
