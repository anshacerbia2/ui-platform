import type { ComponentPropsWithRef } from "react";

export type SidebarBaseRootProps = ComponentPropsWithRef<"aside"> & {
  isOpen?: boolean;
};

export type SidebarBaseToggleProps = ComponentPropsWithRef<"button"> & {
  isOpen?: boolean;
};
export type SidebarBaseHeaderProps = ComponentPropsWithRef<"header">;
export type SidebarBaseNavProps = ComponentPropsWithRef<"nav">;
export type SidebarBaseFooterProps = ComponentPropsWithRef<"footer">;
    