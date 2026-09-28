import type { SidebarBaseToggleProps } from "./types";

/**
 * Toggle button for the Sidebar.
 * Typically used to expand or collapse the sidebar.
 *
 * @example
 * ```tsx
 * <SidebarBase.Root>
 *   <SidebarBase.Toggle onClick={toggleSidebar}>
 *      <MenuIcon />
 *   </SidebarBase.Toggle>
 * </SidebarBase.Root>
 * ```
 */
export const SidebarBaseToggle = ({ 
  isOpen,
  children,
  ...rest 
}: SidebarBaseToggleProps) => {
  return (
    <button 
      type="button" 
      data-slot="toggle"
      aria-expanded={isOpen}
      aria-label="Toggle sidebar" 
      {...rest}
    >
      {children || "☰"}
    </button>
  );
};

SidebarBaseToggle.displayName = "SidebarBaseToggle";
