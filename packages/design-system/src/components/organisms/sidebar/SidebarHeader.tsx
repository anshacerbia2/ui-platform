import { SidebarBaseHeader } from "@scnx/core-ui/components/sidebar-base";
import type { SidebarHeaderProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Header section for the Sidebar.
 * Typically contains the logo or branding.
 */
export const SidebarHeader = ({
  className = "",
  ...rest
}: SidebarHeaderProps) => {
  return (
    <SidebarBaseHeader
      className={cx("scnx-sidebar__header", className)}
      {...rest}
    />
  );
};

SidebarHeader.displayName = "SidebarHeader";
