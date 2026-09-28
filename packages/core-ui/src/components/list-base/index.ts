import { ListBaseRoot, ListBaseItem } from "./ListBase";

export type { ListBaseRootProps, ListBaseItemProps } from "./types";
export { ListBaseRoot, ListBaseItem };

export const ListBase = Object.assign(ListBaseRoot, {
  Item: ListBaseItem,
});
