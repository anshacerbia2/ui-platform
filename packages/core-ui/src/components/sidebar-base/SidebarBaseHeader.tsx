import type { SidebarBaseHeaderProps } from "./types";

/**
 * Header section of the Sidebar.
 * Typically used for logos or titles.
 *
 * @example
 * ```tsx
 * <SidebarBase.Root>
 *   <SidebarBase.Header className="p-4 border-b">
 *     <Logo />
 *   </SidebarBase.Header>
 * </SidebarBase.Root>
 * ```
 */
export const SidebarBaseHeader = ({ 
  ...rest 
}: SidebarBaseHeaderProps) => {
  return <header data-slot="header" {...rest} />;
};

SidebarBaseHeader.displayName = "SidebarBaseHeader";
