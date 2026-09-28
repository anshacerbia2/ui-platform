import "./Navbar.scss";
import type { NavbarProps } from "./types";
import { NavbarRoot as Root } from "./NavbarRoot";
import { NavbarStart as Start } from "./NavbarStart";
import { NavbarCenter as Center } from "./NavbarCenter";
import { NavbarEnd as End } from "./NavbarEnd";

const NavbarCompound = (props: NavbarProps) => <Root {...props} />;
NavbarCompound.displayName = "Navbar";

/**
 * Premium navigational header component.
 * Provides structural slots for Start, Center, and End content.
 * Renders a semantic `<nav>` element.
 *
 * @example
 * ```tsx
 * import { Navbar } from "@scnx/system/navbar";
 *
 * <Navbar>
 *   <Navbar.Start>Logo</Navbar.Start>
 *   <Navbar.Center>Menu</Navbar.Center>
 *   <Navbar.End>Actions</Navbar.End>
 * </Navbar>
 * ```
 */
export const Navbar = Object.assign(NavbarCompound, {
  Root,
  Start,
  Center,
  End,
});
