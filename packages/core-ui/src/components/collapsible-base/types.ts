import type { ComponentPropsWithRef, ReactNode } from "react";
import type { DisclosureItemOptions, DisclosureProviderProps } from "../disclosure-base/types";

/** A disclosure scope; items are independent by default (`type="multiple"`). */
export type CollapsibleBaseRootProps = DisclosureProviderProps & Omit<ComponentPropsWithRef<"div">, "defaultValue" | "onChange">;

export type CollapsibleBaseItemProps = DisclosureItemOptions & {
  children: ReactNode;
} & ComponentPropsWithRef<"div">;

/**
 * A native button that controls one region (`aria-expanded`, `aria-controls`).
 * Its `id` is owned by the item so the pair always resolves (PRM-004).
 */
export type CollapsibleBaseTriggerProps = Omit<ComponentPropsWithRef<"button">, "children" | "type" | "id"> & {
  children: ReactNode | ((state: { isOpen: boolean }) => ReactNode);
};

/** The controlled region; its `id` is owned by the item (PRM-004). */
export type CollapsibleBaseContentProps = Omit<ComponentPropsWithRef<"div">, "id"> & {
  children: ReactNode;
  /** Keep the region mounted while closed (hidden). */
  forceMount?: boolean;
  /**
   * Expose the content as a labelled region (default). Pass `false` when more
   * than about six panels can be open at once (TDD primitives P6).
   */
  region?: boolean;
};
