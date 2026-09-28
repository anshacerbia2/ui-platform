import type { NavigationBaseTextProps } from "./types";

/**
 * Text/Label slot for navigation items.
 */
export const NavigationBaseText = ({ 
  ...rest 
}: NavigationBaseTextProps) => {
  return (
    <span
      data-slot="text"
      {...rest}
    />
  );
};

NavigationBaseText.displayName = "NavigationBaseText";
