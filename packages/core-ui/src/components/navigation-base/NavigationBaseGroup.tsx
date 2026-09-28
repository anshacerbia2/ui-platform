import { Children, cloneElement, CSSProperties, isValidElement, ReactElement } from "react";
import { useNavigationLevel } from "./NavigationLevelContext";
import type { NavigationBaseGroupProps, NavigationBaseItemProps } from "./types";
import { flattenChildren } from "./utils";

/**
 * Container for a group of navigation items.
 * Renders a `<ul>` element.
 *
 * @example
 * ```tsx
 * <NavigationBase.Group>
 *   <NavigationBase.Item label="Item 1" />
 *   <NavigationBase.Item label="Item 2" />
 * </NavigationBase.Group>
 * ```
 */
export const NavigationBaseGroup = ({ 
  children, 
  ...rest 
}: NavigationBaseGroupProps) => {
  const flatChildren = flattenChildren(children);
  let validItemIndex = 0;

  return (
    <ul
      role="list"
      data-part="group"
      {...rest}
    >
      {flatChildren.map((child) => {
        if (isValidElement(child)) {
          const element = child as ReactElement<NavigationBaseItemProps<any>>; // TYPED
          const childTypeName = (element.type as any)?.displayName || "";
          const isHeaderOrDivider = 
            childTypeName.includes("GroupHeader") || 
            childTypeName.includes("Divider");

          if (!isHeaderOrDivider) {
            const currentIndex = validItemIndex++;
            return cloneElement(element, {
              key: element.key || `nav-item-${currentIndex}`,
              "data-index": currentIndex,
              style: {
                ...(element.props.style || {}),
                "--item-index": currentIndex,
              } as CSSProperties, // CAST
            });
          }
        }
        return child;
      })}
    </ul>
  );
};

NavigationBaseGroup.displayName = "NavigationBaseGroup";
