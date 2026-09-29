import type { SidebarBaseRootProps } from "./types";

/**
 * Root container for the Sidebar component.
 * Renders a semantic `<aside>` element.
 * 
 * Typically used as a child of `EdgeLayoutBase` or `FloatingLayoutBase`.
 *
 * @example
 * ```tsx
 * import { SidebarBase } from "@scnx/core-ui/components/sidebar-base";
 * 
 * <SidebarBase.Root className="w-64 border-r">
 *   <SidebarBase.Nav>...</SidebarBase.Nav>
 * </SidebarBase.Root>
 * ```
 */
export const SidebarBaseRoot = ({ 
  isOpen,
  ...rest 
}: SidebarBaseRootProps) => {
  return (
    <aside 
      data-part="root"
      data-state={isOpen ? "expanded" : "collapsed"}
      {...rest}
    />
  );
};  

SidebarBaseRoot.displayName = "SidebarBaseRoot";
