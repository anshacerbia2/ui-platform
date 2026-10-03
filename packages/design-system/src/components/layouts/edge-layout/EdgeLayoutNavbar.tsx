import { useEdgeLayoutContext, EdgeLayoutBaseNavbar } from "@scnx/core-ui/components/edge-layout-base";

import type { EdgeLayoutNavbarProps } from "./types";
import { Navbar } from "../../organisms/navbar";


/**
 * Navbar wrapper for the EdgeLayout.
 * Integrates the `Navbar` organism into the layout structure.
 * 
 * @throws Warns in development if rendered outside of `EdgeLayout.Root`.
 * 
 * @example
 * ```tsx
 * import { EdgeLayout } from "@scnx/system/components/edge-layout";
 * 
 * <EdgeLayout.Navbar>
 *   <EdgeLayout.Navbar.Start>Logo</EdgeLayout.Navbar.Start>
 * </EdgeLayout.Navbar>
 * ```
 */
const NavbarWrapper = ({
  ...rest
}: EdgeLayoutNavbarProps) => {
  useEdgeLayoutContext("EdgeLayout.Navbar");

  return (
    <EdgeLayoutBaseNavbar className="scnx-edge-layout__header">
      <Navbar {...rest} />
    </EdgeLayoutBaseNavbar>
  );
};
NavbarWrapper.displayName = "EdgeLayoutNavbar";

/** 
 * EdgeLayoutNavbar - Integrated Navbar with scoped sub-components.
 */
export const EdgeLayoutNavbar = Object.assign(NavbarWrapper, {
  Start: Navbar.Start,
  Center: Navbar.Center,
  End: Navbar.End,
});
