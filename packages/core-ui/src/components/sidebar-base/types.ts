import type { ComponentPropsWithRef } from "react";

export type SidebarBaseRootProps = ComponentPropsWithRef<"aside"> & {
  isOpen?: boolean;
};

/** The button that expands and collapses a sidebar (TDD primitives P11). */
export type SidebarBaseToggleProps = Omit<ComponentPropsWithRef<"button">, "aria-label"> & {
  isOpen?: boolean;
  /** Accessible name, localized by the consumer; there is no built-in label. */
  label: string;
  /** ID of the sidebar the toggle controls. */
  controls?: string;
};
export type SidebarBaseHeaderProps = ComponentPropsWithRef<"header">;
export type SidebarBaseNavProps = ComponentPropsWithRef<"nav">;
export type SidebarBaseFooterProps = ComponentPropsWithRef<"footer">;
    