import { SidebarBaseToggle } from "@scnx/core-ui/components/sidebar-base";
import type { SidebarToggleProps } from "./types";
import { cx } from "styled-system/css";
import { useSidebar } from "./SidebarContext";

export const SidebarToggle = ({
  className = "",
  children,
  onClick,
  ...rest
}: SidebarToggleProps) => {
  const { toggleOpen } = useSidebar();
  const handleClick = (e: any) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      toggleOpen();
    }
  };
  
  return (
    <SidebarBaseToggle
      className={cx("scnx-sidebar__toggle", className)}
      onClick={handleClick}
      {...rest}
    >
      {children || "☰"}
    </SidebarBaseToggle>
  );
};

SidebarToggle.displayName = "SidebarToggle";
