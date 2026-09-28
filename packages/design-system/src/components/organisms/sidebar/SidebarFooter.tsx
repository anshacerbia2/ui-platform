import { SidebarBaseFooter } from "@scnx/core-ui/components/sidebar-base";
import type { SidebarFooterProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Footer section for the Sidebar.
 * Typically contains user profile or settings.
 */
export const SidebarFooter = ({
  className = "",
  ...rest
}: SidebarFooterProps) => {
  return (
    <SidebarBaseFooter
      className={cx("scnx-sidebar__footer", className)}
      {...rest}
    />
  );
};

SidebarFooter.displayName = "SidebarFooter";
