import type { ComponentPropsWithRef, ReactNode } from "react";
import type { DisclosureItemOptions, DisclosureProviderProps } from "../disclosure-base/types";

/** A disclosure scope; items are independent by default (`type="multiple"`). */
export type CollapsibleBaseRootProps = DisclosureProviderProps & Omit<ComponentPropsWithRef<"div">, "defaultValue" | "onChange">;

export type CollapsibleBaseItemProps = DisclosureItemOptions & {
  children: ReactNode;
} & ComponentPropsWithRef<"div">;

/** A native button that controls one region (`aria-expanded`, `aria-controls`). */
export type CollapsibleBaseTriggerProps = Omit<ComponentPropsWithRef<"button">, "children" | "type"> & {
  children: ReactNode | ((state: { isOpen: boolean }) => ReactNode);
};

export type CollapsibleBaseContentProps = ComponentPropsWithRef<"div"> & {
  children: ReactNode;
  /** Keep the region mounted while closed (hidden). */
  forceMount?: boolean;
};
