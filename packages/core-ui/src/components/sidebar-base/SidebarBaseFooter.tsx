import type { SidebarBaseFooterProps } from "./types";

/**
 * Footer section of the Sidebar.
 * Typically used for profile information or bottom actions.
 *
 * @example
 * ```tsx
 * <SidebarBase.Root>
 *   <SidebarBase.Footer className="p-4 border-t">
 *     <ProfileIcon />
 *   </SidebarBase.Footer>
 * </SidebarBase.Root>
 * ```
 */
export const SidebarBaseFooter = ({ 
  ...rest 
}: SidebarBaseFooterProps) => {
  return <footer data-slot="footer" {...rest} />;
};

SidebarBaseFooter.displayName = "SidebarBaseFooter";
