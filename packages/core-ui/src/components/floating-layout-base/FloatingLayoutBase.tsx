import type { FloatingLayoutBaseRootProps } from "./types";
import { FloatingLayoutBaseRoot as Root } from "./FloatingLayoutBaseRoot";
import { FloatingLayoutBaseSidebar as Sidebar } from "./FloatingLayoutBaseSidebar";
import { FloatingLayoutBaseContent as Content } from "./FloatingLayoutBaseContent";

const FloatingLayoutBaseCompound = ({ ...rest }: FloatingLayoutBaseRootProps) => <Root {...rest} />;
FloatingLayoutBaseCompound.displayName = "FloatingLayoutBase";

/**
 * FloatingLayoutBase - Enterprise Layout system for focused overlays.
 * 
 * Coordinates floating sidebars and centralized content areas.
 *
 * @example
 * ```tsx
 * import { FloatingLayoutBase } from "@scnx/core-ui/components/floating-layout-base";
 * 
 * <FloatingLayoutBase>
 *   <FloatingLayoutBase.Sidebar>Menu</FloatingLayoutBase.Sidebar>
 *   <FloatingLayoutBase.Content>Main</FloatingLayoutBase.Content>
 * </FloatingLayoutBase>
 * ```
 */
export const FloatingLayoutBase = Object.assign(FloatingLayoutBaseCompound, {
  Sidebar,
  Content,
});
