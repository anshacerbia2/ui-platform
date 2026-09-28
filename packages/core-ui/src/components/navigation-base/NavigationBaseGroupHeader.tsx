import type { NavigationBaseGroupHeaderProps } from "./types";

/**
 * Title or header for a navigation group.
 * Renders a `<li>` element.
 *
 * @example
 * ```tsx
 * <NavigationBase.Group>
 *   <NavigationBase.GroupHeader>Section Title</NavigationBase.GroupHeader>
 *   <NavigationBase.Item label="Item 1" />
 * </NavigationBase.Group>
 * ```
 */
export const NavigationBaseGroupHeader = ({ 
  ...rest 
}: NavigationBaseGroupHeaderProps) => {
  return (
    <li
      data-part="group-header"
      {...rest}
    />
  );
};

NavigationBaseGroupHeader.displayName = "NavigationBaseGroupHeader";
