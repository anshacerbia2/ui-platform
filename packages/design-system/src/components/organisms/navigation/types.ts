import type { ElementType } from "react";
import type {
  NavigationBaseBadgeProps,
  NavigationBaseGroupHeaderProps,
  NavigationBaseGroupProps,
  NavigationBaseIconProps,
  NavigationBaseItemContentProps,
  NavigationBaseItemProps,
  NavigationBaseRootProps,
  NavigationBaseTextProps,
  NavigationBaseTrailingIconProps,
} from "@scnx/core-ui/components/navigation-base";

export type NavigationProps = NavigationBaseRootProps;

export type NavigationGroupProps = NavigationBaseGroupProps;

export type NavigationGroupHeaderProps = NavigationBaseGroupHeaderProps;

export type NavigationItemProps<E extends ElementType = "a"> = NavigationBaseItemProps<E>;

export type NavigationIconProps = NavigationBaseIconProps;

export type NavigationItemContentProps = NavigationBaseItemContentProps;

export type NavigationTextProps = NavigationBaseTextProps;

export type NavigationBadgeProps = NavigationBaseBadgeProps;

export type NavigationTrailingIconProps = NavigationBaseTrailingIconProps;
