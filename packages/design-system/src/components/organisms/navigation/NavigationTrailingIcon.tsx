import type { NavigationTrailingIconProps } from "./types";
import { NavigationBaseTrailingIcon } from "@scnx/core-ui/components/navigation-base";

import { cx } from "styled-system/css";

/**
 * Suffix icon for a Navigation item.
 */
export const NavigationTrailingIcon = ({ className = "", ...rest }: NavigationTrailingIconProps) => {
  return (
    <NavigationBaseTrailingIcon
      className={cx("scnx-navigation__trailing-icon", className)}
      {...rest}
    />
  );
};

NavigationTrailingIcon.displayName = "NavigationTrailingIcon";
