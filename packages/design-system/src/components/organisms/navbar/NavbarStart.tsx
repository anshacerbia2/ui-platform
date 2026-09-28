import { NavigationBarBaseStart } from "@scnx/core-ui/components/navigation-bar-base";

import type { NavbarStartProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Start slot for the Navbar.
 */
export const NavbarStart = ({ className = "", ...rest }: NavbarStartProps) => {
  return (
    <NavigationBarBaseStart
      className={cx("scnx-navbar__start", className)}
      {...rest}
    />
  );
};

NavbarStart.displayName = "NavbarStart";
