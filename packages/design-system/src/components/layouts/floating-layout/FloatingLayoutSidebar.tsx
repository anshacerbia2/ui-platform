import { FloatingLayoutBaseSidebar } from "@scnx/core-ui/components/floating-layout-base";

import type { FloatingLayoutSidebarProps } from "./types";
import { cx } from "styled-system/css";
import { Sidebar } from "../../organisms/sidebar/Sidebar";


/**
 * Sidebar container for the FloatingLayout.
 * Wraps `@scnx/core-ui/components/floating-layout-base` and provides the `@scnx/system/components/sidebar` organism.
 * 
 * @example
 * ```tsx
 * import { FloatingLayout } from "@scnx/system/components/floating-layout";
 * 
 * <FloatingLayout.Sidebar>
 *   <FloatingLayout.Sidebar.Nav>...</FloatingLayout.Sidebar.Nav>
 * </FloatingLayout.Sidebar>
 * ```
 */
const FloatingLayoutSidebarCompound = ({ ...rest }: FloatingLayoutSidebarProps) => {
  return (
    <FloatingLayoutBaseSidebar className="scnx-floating-layout__sidebar">
      <Sidebar {...rest} />
    </FloatingLayoutBaseSidebar>
  );
};
FloatingLayoutSidebarCompound.displayName = "FloatingLayoutSidebar";

export const FloatingLayoutSidebar = Object.assign(FloatingLayoutSidebarCompound, Sidebar);
