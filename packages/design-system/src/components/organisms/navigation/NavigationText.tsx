import { NavigationBaseText } from "@scnx/core-ui/components/navigation-base";

import type { NavigationTextProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Text label for a Navigation item.
 */
export const NavigationText = ({ className = "", ...rest }: NavigationTextProps) => {
  return (
    <NavigationBaseText
      className={cx("scnx-navigation__text", className)}
      {...rest}
    />
  );
};

NavigationText.displayName = "NavigationText";
