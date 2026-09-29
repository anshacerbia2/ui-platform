// Public variant types are owned by each component so that published
// declarations do not pull in generated Panda types. These checks keep them
// equal to the recipes in panda.config.ts; they are enforced by `tsc --noEmit`.
import { describe, expectTypeOf, it } from "vitest";
import type {
  containerRecipe,
  flexRecipe,
  gridRecipe,
  headingRecipe,
  listRecipe,
  textRecipe,
} from "styled-system/recipes";
import type { HeadingVariants } from "./atoms/heading/types";
import type { ListVariants } from "./atoms/list/types";
import type { TextVariants } from "./atoms/text/types";
import type { ContainerVariants } from "./layouts/container/types";
import type { FlexVariants } from "./layouts/flex/types";
import type { GridVariants } from "./layouts/grid/types";

type RecipeValues<R extends { variantMap: Record<string, unknown[]> }> = {
  [K in keyof R["variantMap"]]?: R["variantMap"][K][number];
};

describe("public variant types match the Panda recipes", () => {
  it("container", () => {
    expectTypeOf<ContainerVariants>().toEqualTypeOf<RecipeValues<typeof containerRecipe>>();
  });
  it("flex", () => {
    expectTypeOf<FlexVariants>().toEqualTypeOf<RecipeValues<typeof flexRecipe>>();
  });
  it("grid", () => {
    expectTypeOf<GridVariants>().toEqualTypeOf<RecipeValues<typeof gridRecipe>>();
  });
  it("heading", () => {
    expectTypeOf<HeadingVariants>().toEqualTypeOf<RecipeValues<typeof headingRecipe>>();
  });
  it("list", () => {
    expectTypeOf<ListVariants>().toEqualTypeOf<RecipeValues<typeof listRecipe>>();
  });
  it("text", () => {
    expectTypeOf<TextVariants>().toEqualTypeOf<RecipeValues<typeof textRecipe>>();
  });
});
