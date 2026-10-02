import { NavigationBaseItem } from "@scnx/core-ui/components/navigation-base";

import type { NavigationItemProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Individual item within the Navigation.
 */
export const NavigationItem = ({ 
  className = "", 
  iconClassName = "",
  itemContentClassName = "",
  textClassName = "",
  badgeClassName = "",
  trailingIconClassName = "",
  ...rest 
}: NavigationItemProps) => {
  return (
    <NavigationBaseItem
      className={cx("scnx-navigation__item", className)}
      iconClassName={cx("scnx-navigation__icon", iconClassName)}
      itemContentClassName={cx("scnx-navigation__item-content", itemContentClassName)}
      textClassName={cx("scnx-navigation__text", textClassName)}
      badgeClassName={cx("scnx-navigation__badge", badgeClassName)}
      trailingIconClassName={cx("scnx-navigation__trailing-icon", trailingIconClassName)}
      {...(rest as NavigationItemProps)}
    />
  );
};

NavigationItem.displayName = "NavigationItem";
