import type { ComponentPropsWithRef, CSSProperties, HTMLAttributes, MouseEvent, ReactElement, ReactNode, Ref } from "react";

export type NavigationBaseRootProps = Omit<ComponentPropsWithRef<"nav">, "ref">;

export type NavigationBaseGroupProps = Omit<ComponentPropsWithRef<"ul">, "ref">;

export type NavigationBaseGroupHeaderProps = Omit<ComponentPropsWithRef<"li">, "ref">;

type NavigationBaseItemCommonProps = {
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
  /** The current page: `aria-current="page"` on a link. */
  isActive?: boolean;
  /** Disabled: a link loses its href and leaves the tab order; a button is disabled. */
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "onClick" | "className" | "style">;

/**
 * A navigation item (TDD primitives P8): a leaf `a href`, a router link
 * through `asChild`, an action `button` (no href), or a disclosure `button`
 * that shows a nested group (`children`).
 */
export type NavigationBaseItemProps = NavigationBaseItemCommonProps &
  (
    | { href: string; asChild?: false; children?: undefined; isExpanded?: undefined; defaultExpanded?: undefined; onExpandedChange?: undefined }
    | { asChild: true; children: ReactElement; href?: undefined; isExpanded?: undefined; defaultExpanded?: undefined; onExpandedChange?: undefined }
    | {
        /** The nested group this item discloses. */
        children?: ReactNode;
        href?: undefined;
        asChild?: false;
        /** Controlled expansion of the nested group. */
        isExpanded?: boolean;
        defaultExpanded?: boolean;
        onExpandedChange?: (expanded: boolean) => void;
      }
  );

export type NavigationBaseIconProps = ComponentPropsWithRef<"span">;

export type NavigationBaseItemContentProps = ComponentPropsWithRef<"span">;

export type NavigationBaseTextProps = ComponentPropsWithRef<"span">;

export type NavigationBaseBadgeProps = ComponentPropsWithRef<"span">;

export type NavigationBaseTrailingIconProps = ComponentPropsWithRef<"span">;
