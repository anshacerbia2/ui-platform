import type { NavigationIconProps } from "./types";
import { NavigationBaseIcon } from "@scnx/core-ui/components/navigation-base";

import { cx } from "styled-system/css";

/**
 * Prefix icon for a Navigation item.
 */
export const NavigationIcon = ({ className = "", ...rest }: NavigationIconProps) => {
  return (
    <NavigationBaseIcon
      className={cx("scnx-navigation__icon", className)}
      {...rest}
    />
  );
};

NavigationIcon.displayName = "NavigationIcon";
