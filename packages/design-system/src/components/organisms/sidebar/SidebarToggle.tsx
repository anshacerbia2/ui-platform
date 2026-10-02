import type { MouseEvent } from "react";
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
  const { toggleOpen, isOpen, sidebarId } = useSidebar();
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      toggleOpen();
    }
  };
  
  return (
    <SidebarBaseToggle
      className={cx("scnx-sidebar__toggle", className)}
      onClick={handleClick}
      isOpen={isOpen}
      controls={sidebarId}
      {...rest}
    >
      {children || <span aria-hidden="true">☰</span>}
    </SidebarBaseToggle>
  );
};

SidebarToggle.displayName = "SidebarToggle";
