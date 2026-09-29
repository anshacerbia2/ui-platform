"use client";

import type { EdgeLayoutBaseRootProps } from "./types";
import { EdgeLayoutContext } from "./EdgeLayoutContext";

/**
 * Root container for the edge-anchored layout system.
 * Coordinates TopBar, SideBar, and Content areas.
 *
 * @example
 * ```tsx
 * import { EdgeLayoutBase, NavigationBarBase, SidebarBase } from "@scnx/core-ui/components/edge-layout-base";
 * 
 * <EdgeLayoutBase>
 *   <EdgeLayoutBase.NavigationBar>
 *     <NavigationBarBase>...</NavigationBarBase>
 *   </EdgeLayoutBase.NavigationBar>
 *   <EdgeLayoutBase.Sidebar>
 *     <SidebarBase>...</SidebarBase>
 *   </EdgeLayoutBase.Sidebar>
 *   <EdgeLayoutBase.Content>
 *     <main>Main Content</main>
 *   </EdgeLayoutBase.Content>
 * </EdgeLayoutBase>
 * ```
 */
export const EdgeLayoutBaseRoot = ({
  ...rest
}: EdgeLayoutBaseRootProps) => {
  return (
    <EdgeLayoutContext value={true}>
      <div {...rest} />
    </EdgeLayoutContext>
  );
};

EdgeLayoutBaseRoot.displayName = "EdgeLayoutBaseRoot";
