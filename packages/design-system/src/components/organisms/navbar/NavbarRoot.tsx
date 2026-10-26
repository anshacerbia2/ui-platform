import { NavigationBarBaseRoot } from "@scnx/core-ui/components/navigation-bar-base";
import type { NavbarProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Root component for the Navbar.
 */
export const NavbarRoot = ({ 
  className = "", 
  variant = "default",
  ...rest 
}: NavbarProps) => {
  return (
    <NavigationBarBaseRoot className={cx("scnx-navbar", className)} data-variant={variant} {...(rest as any)} />
  );
};

NavbarRoot.displayName = "NavbarRoot";
