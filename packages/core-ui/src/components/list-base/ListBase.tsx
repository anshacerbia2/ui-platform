import type { ListBaseRootProps, ListBaseItemProps } from "./types";
import { Slot } from "../../utils/Slot";

export const ListBaseRoot = ({ asChild, type = "unordered", ...props }: ListBaseRootProps) => {
  if (asChild) return <Slot data-slot="list" {...props} />;
  
  const Tag = (type === "ordered" ? "ol" : "ul") as any;
  return <Tag data-slot="list" {...props} />;
};

export const ListBaseItem = ({ asChild, ...props }: ListBaseItemProps) => {
  const Component = asChild ? Slot : "li";
  return <Component data-slot="list-item" {...props} />;
};
