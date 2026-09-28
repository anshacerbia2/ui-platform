import type { NavigationBaseTrailingIconProps } from "./types";

/**
 * Trailing icon slot for navigation items.
 */
export const NavigationBaseTrailingIcon = ({ 
  ...rest 
}: NavigationBaseTrailingIconProps) => {
  return (
    <span
      data-slot="trailing-icon"
      aria-hidden="true"
      {...rest}
    />
  );
};

NavigationBaseTrailingIcon.displayName = "NavigationBaseTrailingIcon";
