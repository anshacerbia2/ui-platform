import { NavigationBarBaseEnd } from "@scnx/core-ui/components/navigation-bar-base";

import type { NavbarEndProps } from "./types";
import { cx } from "styled-system/css";

/**
 * End slot for the Navbar.
 */
export const NavbarEnd = ({ className = "", ...rest }: NavbarEndProps) => {
  return (
    <NavigationBarBaseEnd
      className={cx("scnx-navbar__end", className)}
      {...rest}
    />
  );
};

NavbarEnd.displayName = "NavbarEnd";
