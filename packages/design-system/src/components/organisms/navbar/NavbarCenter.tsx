import { NavigationBarBaseCenter } from "@scnx/core-ui/components/navigation-bar-base";

import type { NavbarCenterProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Center slot for the Navbar.
 */
export const NavbarCenter = ({ className = "", ...rest }: NavbarCenterProps) => {
  return (
    <NavigationBarBaseCenter
      className={cx("scnx-navbar__center", className)}
      {...rest}
    />
  );
};

NavbarCenter.displayName = "NavbarCenter";
