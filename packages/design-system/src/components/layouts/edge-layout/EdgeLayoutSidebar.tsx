"use client";

import { useEdgeLayoutContext, EdgeLayoutBaseSidebar } from "@scnx/core-ui/components/edge-layout-base";

import type { EdgeLayoutSidebarProps } from "./types";
import { Sidebar } from "../../organisms/sidebar";

const EdgeLayoutBaseSidebarCompound = ({
  ...rest
}: EdgeLayoutSidebarProps) => {
  useEdgeLayoutContext("EdgeLayout.Sidebar");

  return (
    <EdgeLayoutBaseSidebar className="scnx-edge-layout__sidebar">
      <Sidebar {...rest} />
    </EdgeLayoutBaseSidebar>
  );
};
EdgeLayoutBaseSidebarCompound.displayName = "EdgeLayoutSidebar";

/**
 * Sidebar wrapper for the EdgeLayout.
 * Integrates the `Sidebar` organism into the layout structure.
 * 
 * @throws Warns in development if rendered outside of `EdgeLayout.Root`.
 * 
 * @example
 * ```tsx
 * import { EdgeLayout } from "@scnx/system/components/edge-layout";
 * 
 * <EdgeLayout.Sidebar>...</EdgeLayout.Sidebar>
 * ```
 */
export const EdgeLayoutSidebar = Object.assign(EdgeLayoutBaseSidebarCompound, {
  Header: Sidebar.Header,
  Toggle: Sidebar.Toggle,
  Nav: Sidebar.Nav,
  Footer: Sidebar.Footer,
});
