import type { ElementType } from "react";

import type { NavigationProps } from "./types";
import { NavigationRoot as Root } from "./NavigationRoot";
import { NavigationGroup as Group } from "./NavigationGroup";
import { NavigationGroupHeader as GroupHeader } from "./NavigationGroupHeader";
import { NavigationItem as Item } from "./NavigationItem";
import { NavigationIcon as Icon } from "./NavigationIcon";
import { NavigationItemContent as ItemContent } from "./NavigationItemContent";
import { NavigationText as Text } from "./NavigationText";
import { NavigationBadge as Badge } from "./NavigationBadge";
import { NavigationTrailingIcon as TrailingIcon } from "./NavigationTrailingIcon";

import "./Navigation.scss";

const NavigationCompound = (props: NavigationProps) => <Root {...props} />;
NavigationCompound.displayName = "Navigation";

/**
 * Styled navigation component for primary or secondary app navigation.
 * Highly composable through structural slots (Group, Item, Icon, etc.).
 * Renders a semantic `<nav>` element.
 *
 * @example
 * ```tsx
 * import { Navigation } from "@scnx/system/components/navigation";
 * 
 * <Navigation>
 *   <Navigation.Group>
 *     <Navigation.GroupHeader>Main</Navigation.GroupHeader>
 *     <Navigation.Item active={true}>
 *       <Navigation.Icon>Home</Navigation.Icon>
 *       <Navigation.Text>Dashboard</Navigation.Text>
 *     </Navigation.Item>
 *   </Navigation.Group>
 * </Navigation>
 * ```
 */
export const Navigation = Object.assign(NavigationCompound, {
  Group,
  GroupHeader,
  Item,
  Icon,
  ItemContent,
  Text,
  Badge,
  TrailingIcon,
});
