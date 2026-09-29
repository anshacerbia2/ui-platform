import "./FloatingLayout.scss";
import type { FloatingLayoutProps } from "./types";
import { FloatingLayoutRoot as Root } from "./FloatingLayoutRoot";
import { FloatingLayoutSidebar as Sidebar } from "./FloatingLayoutSidebar";
import { FloatingLayoutContent as Content } from "./FloatingLayoutContent";

const FloatingLayoutCompound = (props: FloatingLayoutProps) => <Root {...props} />;
FloatingLayoutCompound.displayName = "FloatingLayout";

/**
 * Provides a sticky sidebar layout structure.
 * Assemblies Root, Sidebar, and Content slots.
 *
 * @example
 * ```tsx
 * import { FloatingLayout } from "@scnx/system/components/floating-layout";
 * 
 * <FloatingLayout>
 *   <FloatingLayout.Sidebar>...</FloatingLayout.Sidebar>
 *   <FloatingLayout.Content>Main Scrollable Area</FloatingLayout.Content>
 * </FloatingLayout>
 * ```
 */
export const FloatingLayout = Object.assign(FloatingLayoutCompound, {
  Sidebar,
  Content,
});
