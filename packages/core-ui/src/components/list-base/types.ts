import type { ComponentPropsWithRef } from "react";

/** A list; `type` picks `ul` (default) or `ol`. */
export type ListBaseRootProps = { type?: "unordered" | "ordered" } & Omit<ComponentPropsWithRef<"ul">, "type">;
export type ListBaseItemProps = ComponentPropsWithRef<"li">;
