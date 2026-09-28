import type { SidebarBaseNavProps } from "./types";

/**
 * Navigation section of the Sidebar.
 * Renders a `<nav>` element.
 *
 * @example
 * ```tsx
 * <SidebarBase.Root>
 *   <SidebarBase.Nav className="flex-1 overflow-y-auto">
 *      <NavigationBase>...</NavigationBase>
 *   </SidebarBase.Nav>
 * </SidebarBase.Root>
 * ```
 */
export const SidebarBaseNav = ({ 
  ...rest 
}: SidebarBaseNavProps) => {
  return <nav data-slot="navigation" {...rest} />;
};


SidebarBaseNav.displayName = "SidebarBaseNav";
