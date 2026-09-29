"use client";

import type { ElementType, MouseEvent, ReactElement } from "react";
import type { NavigationBaseItemProps } from "./types";
import { NavigationLevelContext, useNavigationLevel } from "./NavigationLevelContext";
import { NavigationBaseIcon as Icon } from "./NavigationBaseIcon";
import { NavigationBaseItemContent as ItemContent } from "./NavigationBaseItemContent";
import { NavigationBaseText as Text } from "./NavigationBaseText";
import { NavigationBaseBadge as Badge } from "./NavigationBaseBadge";
import { NavigationBaseTrailingIcon as TrailingIcon } from "./NavigationBaseTrailingIcon";

/**
 * Navigation item component with polymorphic rendering.
 * Renders a `<li>` element containing the link/button and optional sub-navigation.
 * 
 * Handles active states, expansion for nested navigation, and ARIA attributes.
 *
 * @example
 * ```tsx
 * import { NavigationBase } from "@scnx/core-ui/components/navigation-base";
 * 
 * <NavigationBase.Group>
 *   <NavigationBase.Item 
 *     label="Reports" 
 *     icon={<ReportsIcon />} 
 *     isExpanded 
 *     isActive
 *   >
 *     <NavigationBase.Group>
 *       <NavigationBase.Item label="Monthly Sales" />
 *       <NavigationBase.Item label="Inventory" />
 *     </NavigationBase.Group>
 *   </NavigationBase.Item>
 * </NavigationBase.Group>
 * ```
 */
export const NavigationBaseItem = <E extends ElementType = "a">({
  as = "a" as E,
  className,
  iconClassName,
  itemContentClassName,
  textClassName,
  badgeClassName,
  trailingIconClassName,
  style,
  label,
  icon,
  badge,
  trailingIcon,
  children,
  isActive,
  isExpanded,
  isDisabled = false,
  onClick,
  ...rest
}: NavigationBaseItemProps<E>): ReactElement => {
  const currentLevel = useNavigationLevel();
  const Component = as as any;

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const { "data-index": dataIndex, ...componentRest } = rest;

  return (
    <li
      role="listitem"
      data-part="item"
      style={style}
      data-index={dataIndex}
      data-level={currentLevel}
    >
      <Component
        data-part="trigger"
        className={className}
        data-active={isActive ?? undefined}
        data-expanded={children ? isExpanded : undefined}
        data-disabled={isDisabled ?? undefined}
        aria-current={isActive ? ("page" as const) : undefined}
        aria-expanded={children ? isExpanded : undefined}
        aria-haspopup={children ? "true" : undefined}
        aria-disabled={isDisabled ?? undefined}
        onClick={handleClick as any}
        {...componentRest}
      >
        {icon && <Icon className={iconClassName}>{icon}</Icon>}
        <ItemContent className={itemContentClassName}>
          <Text className={textClassName}>{label}</Text>
          {badge && <Badge className={badgeClassName}>{badge}</Badge>}
          {trailingIcon && (
            <TrailingIcon className={trailingIconClassName}>
              {trailingIcon}
            </TrailingIcon>
          )}
        </ItemContent>
      </Component>
      {children && (
        <NavigationLevelContext value={currentLevel + 1}>
          <div style={{ display: "contents" }}>{children}</div>
        </NavigationLevelContext>
      )}
    </li>
  );
};

NavigationBaseItem.displayName = "NavigationBaseItem";
