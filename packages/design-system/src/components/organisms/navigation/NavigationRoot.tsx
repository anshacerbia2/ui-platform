import { NavigationBaseRoot } from "@scnx/core-ui/components/navigation-base";
import type { NavigationProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Root container for the Navigation component.
 */
export const NavigationRoot = ({ 
  className = "", 
  ...rest 
}: NavigationProps) => {
  return (
    <NavigationBaseRoot className={cx("scnx-navigation", className)} {...(rest as any)} />
  );
};

NavigationRoot.displayName = "NavigationRoot";
