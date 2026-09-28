import type { NavigationGroupHeaderProps } from "./types";
import { NavigationBaseGroupHeader } from "@scnx/core-ui/components/navigation-base";

import { cx } from "styled-system/css";

/**
 * Header for a Navigation group.
 */
export const NavigationGroupHeader = ({ className = "", ...rest }: NavigationGroupHeaderProps) => {
  return (
    <NavigationBaseGroupHeader
      className={cx("scnx-navigation__group-header", className)}
      {...rest}
    />
  );
};

NavigationGroupHeader.displayName = "NavigationGroupHeader";
