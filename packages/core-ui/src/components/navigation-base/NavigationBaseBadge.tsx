import type { NavigationBaseBadgeProps } from "./types";

/**
 * Badge slot for navigation items.
 */
export const NavigationBaseBadge = ({ 
  ...rest 
}: NavigationBaseBadgeProps) => {
  return (
    <span
      data-slot="badge"
      {...rest}
    />
  );
};

NavigationBaseBadge.displayName = "NavigationBaseBadge";
