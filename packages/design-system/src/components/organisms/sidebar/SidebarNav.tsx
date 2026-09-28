import type { SidebarNavProps } from "./types";
import { cx } from "styled-system/css";
import { Navigation, NavigationRoot } from "../../organisms/navigation";
import { SidebarNavItem } from "./SidebarNavItem";

/**
 * Navigation section for the Sidebar.
 * Utilizes the `Navigation` organism internally.
 */
const Nav = ({ className = "", ...rest }: SidebarNavProps) => {
  return (
    <NavigationRoot
      className={cx("scnx-sidebar__navigation", className)}
      {...rest}
    />
  );
};

export const SidebarNav = Object.assign(Nav, Navigation, {
  Item: SidebarNavItem,
  displayName: "SidebarNav"
});

