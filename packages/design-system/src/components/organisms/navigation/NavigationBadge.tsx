import type { NavigationBadgeProps } from "./types";
import { NavigationBaseBadge } from "@scnx/core-ui/components/navigation-base";

import { cx } from "styled-system/css";

/**
 * Badge for a Navigation item (e.g., status indicator).
 */
export const NavigationBadge = ({ className = "", ...rest }: NavigationBadgeProps) => {
  return (
    <NavigationBaseBadge
      className={cx("scnx-navigation__badge", className)}
      {...rest}
    />
  );
};

NavigationBadge.displayName = "NavigationBadge";
