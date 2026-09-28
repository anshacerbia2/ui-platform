import type { NavigationBarBaseEndProps } from "./types";

/**
 * End section of the navigation bar.
 * Typically used for actions or profile entry.
 *
 * @example
 * ```tsx
 * <NavigationBarBase.Root>
 *   <NavigationBarBase.End>
 *     <ButtonBase>Login</ButtonBase>
 *   </NavigationBarBase.End>
 * </NavigationBarBase.Root>
 * ```
 */
export const NavigationBarBaseEnd = ({ 
  children, 
  ...rest 
}: NavigationBarBaseEndProps) => {
  return <div data-slot="end" {...rest}>{children}</div>;

};

NavigationBarBaseEnd.displayName = "NavigationBarBaseEnd";
