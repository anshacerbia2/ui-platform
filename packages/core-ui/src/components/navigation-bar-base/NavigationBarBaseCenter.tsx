import type { NavigationBarBaseCenterProps } from "./types";

/**
 * Center section of the navigation bar.
 * Typically used for main navigation links.
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Root>
 *   <NavigationBarBase.Center>
 *     <NavigationBarBase.Nav>
 *       Nav items
 *     </NavigationBarBase.Nav>
 *   </NavigationBarBase.Center>
 * </NavigationBarBase.Root>
 * ```
 */
export const NavigationBarBaseCenter = ({ 
  children, 
  ...rest 
}: NavigationBarBaseCenterProps) => {
  return <div data-slot="center" {...rest}>{children}</div>;

};

NavigationBarBaseCenter.displayName = "NavigationBarBaseCenter";
