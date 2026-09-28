import type { NavigationBarBaseRootProps } from "./types";

/**
 * Root container for NavigationBarBase structure.
 * Renders a `<header>` element.
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Root className="bg-white shadow">
 *   <NavigationBarBase.Start>Logos</NavigationBarBase.Start>
 *   <NavigationBarBase.Center>Links</NavigationBarBase.Center>
 *   <NavigationBarBase.End>Actions</NavigationBarBase.End>
 * </NavigationBarBase.Root>
 * ```
 */
export const NavigationBarBaseRoot = ({ 
  children, 
  ...rest 
}: NavigationBarBaseRootProps) => {
  return <header {...rest}>{children}</header>;


};

NavigationBarBaseRoot.displayName = "NavigationBarBaseRoot";
