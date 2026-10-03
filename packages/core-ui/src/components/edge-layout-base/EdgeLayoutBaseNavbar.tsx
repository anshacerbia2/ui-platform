import type { EdgeLayoutBaseNavbarProps } from "./types";
import { useEdgeLayoutContext } from "./EdgeLayoutContext";

/**
 * NavBar section for the edge layout.
 * Coordinates with the layout context for proper positioning.
 */
export const EdgeLayoutBaseNavbar = ({ 
  ...rest 
}: EdgeLayoutBaseNavbarProps) => {
  useEdgeLayoutContext("Navbar");

  return (
    <div data-slot="navbar" {...rest} />
  );
};

EdgeLayoutBaseNavbar.displayName = "EdgeLayoutBaseNavbar";
