import type { FloatingLayoutBaseSidebarProps } from "./types";

/**
 * Sidebar section for the floating layout.
 */
export const FloatingLayoutBaseSidebar = ({ 
  ...rest 
}: FloatingLayoutBaseSidebarProps) => (
  <div data-slot="sidebar" {...rest} />
);

FloatingLayoutBaseSidebar.displayName = "FloatingLayoutBaseSidebar";
