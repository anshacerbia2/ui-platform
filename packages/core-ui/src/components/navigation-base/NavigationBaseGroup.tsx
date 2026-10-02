import { cloneElement, isValidElement, useContext, type CSSProperties, type ReactElement } from "react";
import { useHydrated } from "../../utils/use-hydrated";
import { SubgroupIdContext } from "./NavigationBaseItem";
import { useNavigationLevel } from "./NavigationLevelContext";
import type { NavigationBaseGroupProps } from "./types";
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
  id,
  ...rest 
}: NavigationBaseGroupProps) => {
  // A group nested in an item takes the ID its disclosure button controls.
  const subgroupId = useContext(SubgroupIdContext);
  const flatChildren = flattenChildren(children);
  // `--item-index` drives the styled stagger; it is set after hydration only,
  // because a strict CSP blocks style attributes in server markup (THM-009).
  const hydrated = useHydrated();
  let validItemIndex = 0;

  return (
    <ul
      id={id ?? subgroupId ?? undefined}
      data-part="group"
      {...rest}
    >
      {flatChildren.map((child) => {
        if (isValidElement(child)) {
          const element = child as ReactElement<{ style?: CSSProperties } & Record<string, unknown>>;
          const childTypeName = (element.type as any)?.displayName || "";
          const isHeaderOrDivider = 
            childTypeName.includes("GroupHeader") || 
            childTypeName.includes("Divider");

          if (!isHeaderOrDivider) {
            const currentIndex = validItemIndex++;
            return cloneElement(element, {
              key: element.key || `nav-item-${currentIndex}`,
              "data-index": currentIndex,
              ...(hydrated ? { style: { ...(element.props.style || {}), "--item-index": currentIndex } as CSSProperties } : {}),
            });
          }
        }
        return child;
      })}
    </ul>
  );
};

NavigationBaseGroup.displayName = "NavigationBaseGroup";
