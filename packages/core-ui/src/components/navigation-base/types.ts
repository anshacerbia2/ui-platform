import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

export type NavigationBaseRootProps = Omit<ComponentPropsWithRef<"nav">, "ref">;

export type NavigationBaseGroupProps = Omit<ComponentPropsWithRef<"ul">, "ref">;

export type NavigationBaseGroupHeaderProps = Omit<ComponentPropsWithRef<"li">, "ref">;

export type NavigationBaseItemProps<E extends ElementType = "a"> = {
  /** The underlying element type. @default "a" */
  as?: E;
  /** Custom CSS classes for the badge. */
  badgeClassName?: string;
  /** Custom CSS classes for the item container. */
  itemContentClassName?: string;
  /** Custom CSS classes for the icon. */
  iconClassName?: string;
  /** Custom CSS classes for the label text. */
  textClassName?: string;
  /** Custom CSS classes for the trailing icon. */
  trailingIconClassName?: string;
  /** Label text for the navigation item. */
  label: string;
  /** Optional icon to display before the label. */
  icon?: ReactNode;
  /** Optional badge content (e.g., notification count). */
  badge?: ReactNode;
  /** Optional trailing icon (e.g., external link indicator or arrow). */
  trailingIcon?: ReactNode;
  /** Whether the item is currently active. */
  isActive?: boolean;
  /** Whether the item's sub-navigation is expanded. */
  isExpanded?: boolean;
  /** Whether the item is disabled. */
  isDisabled?: boolean;
} & Omit<ComponentPropsWithRef<E>, "as" | "label"> & {
  children?: ReactNode;
};

export type NavigationBaseIconProps = ComponentPropsWithRef<"span">;

export type NavigationBaseItemContentProps = ComponentPropsWithRef<"span">;

export type NavigationBaseTextProps = ComponentPropsWithRef<"span">;

export type NavigationBaseBadgeProps = ComponentPropsWithRef<"span">;

export type NavigationBaseTrailingIconProps = ComponentPropsWithRef<"span">;
