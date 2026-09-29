import type { SidebarBaseRootProps } from "./types";
import { SidebarBaseRoot as Root } from "./SidebarBaseRoot";
import { SidebarBaseToggle as Toggle } from "./SidebarBaseToggle";
import { SidebarBaseHeader as Header } from "./SidebarBaseHeader";
import { SidebarBaseNav as Nav } from "./SidebarBaseNav";
import { SidebarBaseFooter as Footer } from "./SidebarBaseFooter";

const SidebarBaseCompound = ({ ...rest }: SidebarBaseRootProps) => <Root {...rest} />;
SidebarBaseCompound.displayName = "SidebarBase";

/**
 * SidebarBase - Professional Headless Sidebar foundation.
 * 
 * Coordinates vertical application navigation and utility sections.
 *
 * @example
 * ```tsx
 * import { SidebarBase, NavigationBase } from "@scnx/core-ui/components/sidebar-base";
 * 
 * const AppSidebar = () => (
 *   <SidebarBase>
 *     <SidebarBase.Header>Title</SidebarBase.Header>
 *     <SidebarBase.Nav>
 *       Nav content
 *     </SidebarBase.Nav>
 *     <SidebarBase.Footer>Profile</SidebarBase.Footer>
 *   </SidebarBase>
 * );
 * ```
 */
export const SidebarBase = Object.assign(SidebarBaseCompound, {
  Toggle,
  Header,
  Nav,
  Footer,
});
