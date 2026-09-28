import type { NavigationBaseRootProps } from "./types";

/**
 * Root container for NavigationBase structure.
 * Renders a semantic `<nav>` element.
 *
 * @example
 * ```tsx
 * import { NavigationBase } from "@scnx/core-ui";
 * 
 * <NavigationBase.Root className="w-full">
 *   Nav content
 * </NavigationBase.Root>
 * ```
 */
export const NavigationBaseRoot = ({ 
  ...rest 
}: NavigationBaseRootProps) => {
  return (
    <nav role="navigation" data-part="root" {...rest} />
  );
};

NavigationBaseRoot.displayName = "NavigationBaseRoot";
