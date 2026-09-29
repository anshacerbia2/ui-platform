import type { NavigationBaseRootProps } from "./types";
import { NavigationBaseRoot as Root } from "./NavigationBaseRoot";
import { NavigationBaseGroup as Group } from "./NavigationBaseGroup";
import { NavigationBaseGroupHeader as GroupHeader } from "./NavigationBaseGroupHeader";
import { NavigationBaseItem as Item } from "./NavigationBaseItem";
import { NavigationBaseIcon as Icon } from "./NavigationBaseIcon";
import { NavigationBaseItemContent as ItemContent } from "./NavigationBaseItemContent";
import { NavigationBaseText as Text } from "./NavigationBaseText";
import { NavigationBaseBadge as Badge } from "./NavigationBaseBadge";
import { NavigationBaseTrailingIcon as TrailingIcon } from "./NavigationBaseTrailingIcon";

const NavigationBaseCompound = ({ ...rest }: NavigationBaseRootProps) => <Root {...rest} />;
NavigationBaseCompound.displayName = "NavigationBase";

/**
 * NavigationBase - Professional Headless Navigation system foundation.
 *
 * Coordinates hierarchical navigation with automatic level tracking, 
 * index injection, and state management via data attributes.
 *
 * @example
 * ```tsx
 * import { NavigationBase } from "@scnx/core-ui/components/navigation-base";
 * 
 * const SideNav = () => (
 *   <NavigationBase>
 *     <NavigationBase.Group>
 *       <NavigationBase.GroupHeader>Main</NavigationBase.GroupHeader>
 *       <NavigationBase.Item label="Dashboard" isActive />
 *       <NavigationBase.Item label="Sales" isExpanded>
 *          <NavigationBase.Group>
 *            <NavigationBase.Item label="Daily" />
 *            <NavigationBase.Item label="Monthly" />
 *          </NavigationBase.Group>
 *       </NavigationBase.Item>
 *     </NavigationBase.Group>
 *   </NavigationBase>
 * );
 * ```
 */
export const NavigationBase = Object.assign(NavigationBaseCompound, {
  Group,
  GroupHeader,
  Item,
  Icon,
  ItemContent,
  Text,
  Badge,
  TrailingIcon,
});
