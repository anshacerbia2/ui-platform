import type { NavigationBarBaseStartProps } from "./types";

/**
 * Start section of the navigation bar.
 * Typically used for branding or logos.
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Root>
 *   <NavigationBarBase.Start>
 *     <img src="/logo.svg" alt="Brand" />
 *   </NavigationBarBase.Start>
 * </NavigationBarBase.Root>
 * ```
 */
export const NavigationBarBaseStart = ({ 
  children, 
  ...rest 
}: NavigationBarBaseStartProps) => {
  return <div data-slot="start" {...rest}>{children}</div>;

};

NavigationBarBaseStart.displayName = "NavigationBarBaseStart";
