import { NavigationBarBaseLink } from "@scnx/core-ui/components/navigation-bar-base";

import type { NavbarLinkProps } from "./types";
import { cx } from "styled-system/css";

/**
 * One destination in the Navbar: a pill link; `current` marks the page the
 * reader is on. With `asChild` it styles its single child, such as a router
 * Link.
 */
export const NavbarLink = ({ className, ...rest }: NavbarLinkProps) => <NavigationBarBaseLink className={cx("scnx-navbar__link", className)} {...rest} />;

NavbarLink.displayName = "NavbarLink";
