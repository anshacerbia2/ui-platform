import type { NavigationBaseIconProps } from "./types";

/**
 * Icon slot for navigation items.
 */
export const NavigationBaseIcon = ({ 
  ...rest 
}: NavigationBaseIconProps) => {
  return (
    <span
      data-slot="icon"
      aria-hidden="true"
      {...rest}
    />
  )
};

NavigationBaseIcon.displayName = "NavigationBaseIcon";
