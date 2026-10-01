import type { SidebarProps } from "./types";
import { SidebarRoot as Root } from "./SidebarRoot";
import { SidebarToggle as Toggle } from "./SidebarToggle";
import { SidebarHeader as Header } from "./SidebarHeader";
import { SidebarNav as Nav } from "./SidebarNav";
import { SidebarFooter as Footer } from "./SidebarFooter";

const SidebarCompound = ({...rest}: SidebarProps) => <Root {...rest} />;
SidebarCompound.displayName = "Sidebar";

/**
 * Styled sidebar system with composable sub-components.
 * Assemblies Root, Toggle, Header, Nav, and Footer.
 * Overrides Navigation.Item with SidebarNavItem for sidebar-specific expand/collapse and flyout logic.
 *
 * @example
 * ```tsx
 * import { Sidebar } from "@scnx/system/components/sidebar";
 *
 * <Sidebar>
 *   <Sidebar.Header>Logo</Sidebar.Header>
 *   <Sidebar.Nav>...</Sidebar.Nav>
 * </Sidebar>
 * ```
 */
export const Sidebar = Object.assign(SidebarCompound, {
  Toggle,
  Header,
  Nav,
  Footer,
});

