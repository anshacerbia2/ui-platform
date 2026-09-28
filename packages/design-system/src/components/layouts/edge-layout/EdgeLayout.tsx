import "./EdgeLayout.scss";
import type { EdgeLayoutRootProps } from "./types";
import { EdgeLayoutRoot as Root } from "./EdgeLayoutRoot";
import { EdgeLayoutNavbar as Navbar } from "./EdgeLayoutNavbar";
import { EdgeLayoutSidebar as Sidebar } from "./EdgeLayoutSidebar";
import { EdgeLayoutContent as Content } from "./EdgeLayoutContent";

const EdgeLayoutCompound = ({ ...rest }: EdgeLayoutRootProps) => <Root {...rest} />;
EdgeLayoutCompound.displayName = "EdgeLayout";

/**
 * Provides an "Edge-to-Edge" layout structure with sticky header and sidebar.
 * Renders a semantic application shell structure.
 *
 * @example
 * ```tsx
 * import { EdgeLayout } from "@scnx/system/edge-layout";
 * 
 * <EdgeLayout>
 *   <EdgeLayout.Navbar>
 *     <EdgeLayout.Navbar.Start>Logo</EdgeLayout.Navbar.Start>
 *   </EdgeLayout.Navbar>
 *   <EdgeLayout.Sidebar>...</EdgeLayout.Sidebar>
 *   <EdgeLayout.Content>...</EdgeLayout.Content>
 * </EdgeLayout>
 * ```
 */
export const EdgeLayout = Object.assign(EdgeLayoutCompound, {
  Navbar,
  Sidebar,
  Content,
});
