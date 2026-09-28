import type { NavigationItemContentProps } from "./types";
import { NavigationBaseItemContent } from "@scnx/core-ui/components/navigation-base";

import { cx } from "styled-system/css";

/**
 * Main content area for a Navigation item (usually contains Text).
 */
export const NavigationItemContent = ({ className = "", ...rest }: NavigationItemContentProps) => {
  return (
    <NavigationBaseItemContent
      className={cx("scnx-navigation__item-content", className)}
      {...rest}
    />
  );
};

NavigationItemContent.displayName = "NavigationItemContent";
