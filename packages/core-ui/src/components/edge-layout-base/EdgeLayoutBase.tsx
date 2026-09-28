import type { EdgeLayoutBaseRootProps } from "./types";
import { EdgeLayoutBaseRoot as Root } from "./EdgeLayoutBaseRoot";
import { EdgeLayoutBaseContent as Content } from "./EdgeLayoutBaseContent";
import { EdgeLayoutBaseNavbar as Navbar } from "./EdgeLayoutBaseNavbar";
import { EdgeLayoutBaseSidebar as Sidebar } from "./EdgeLayoutBaseSidebar";

const EdgeLayoutBaseCompound = ({ ...rest }: EdgeLayoutBaseRootProps) => <Root {...rest} />;
EdgeLayoutBaseCompound.displayName = "EdgeLayoutBase";

/**
 * EdgeLayoutBase - Enterprise Layout system foundation.
 * 
 * Coordinates high-level application regions (Header, Sidebar, Content).
 *
 * @example
 * ```tsx
 * import { EdgeLayoutBase } from "@scnx/core-ui";
 * 
 * <EdgeLayoutBase>
 *   <EdgeLayoutBase.Navbar>Header</EdgeLayoutBase.Navbar>

 *   <EdgeLayoutBase.Sidebar>Sidebar</EdgeLayoutBase.Sidebar>
 *   <EdgeLayoutBase.Content>Main</EdgeLayoutBase.Content>
 * </EdgeLayoutBase>
 * ```
 */
export const EdgeLayoutBase = Object.assign(EdgeLayoutBaseCompound, {
  Navbar,
  Sidebar,
  Content,
});
