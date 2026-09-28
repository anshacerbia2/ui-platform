import type { NavigationBaseItemContentProps } from "./types";

/**
 * Content wrapper slot for navigation items.
 */
export const NavigationBaseItemContent = ({ 
  ...rest 
}: NavigationBaseItemContentProps) => {
  return (
    <span
      data-part="content"
      {...rest}
    />
  );
};

NavigationBaseItemContent.displayName = "NavigationBaseItemContent";
