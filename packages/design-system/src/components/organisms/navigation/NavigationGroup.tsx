import { NavigationBaseGroup } from "@scnx/core-ui/components/navigation-base";
import type { NavigationGroupProps } from "./types";
import { cx } from "styled-system/css";

export const NavigationGroup = ({ className = "", ...rest }: NavigationGroupProps) => {
  return (
    <NavigationBaseGroup className={cx("scnx-navigation__group", className)} {...rest} />
  );
};

NavigationGroup.displayName = "NavigationGroup";
