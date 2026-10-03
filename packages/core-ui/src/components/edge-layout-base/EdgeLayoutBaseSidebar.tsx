import type { EdgeLayoutBaseSidebarProps } from "./types";
import { useEdgeLayoutContext } from "./EdgeLayoutContext";

/**
 * Sidebar section for the edge layout.
 */
export const EdgeLayoutBaseSidebar = ({ 
  ...rest 
}: EdgeLayoutBaseSidebarProps) => {
  useEdgeLayoutContext("Sidebar");

  return (
    <div data-slot="sidebar" {...rest} />
  );
};

EdgeLayoutBaseSidebar.displayName = "EdgeLayoutBaseSidebar";
