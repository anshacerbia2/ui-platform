import { SidebarBaseRoot } from "@scnx/core-ui/components/sidebar-base";

import type { SidebarProps } from "./types";
import { cx } from "styled-system/css";
import { useSidebar } from "./SidebarContext";
import { SidebarFlyout } from "./SidebarFlyout";
import { useEffect } from "react";

/**
 * Root component for the Sidebar.
 * Manages the main container and high-level state.
 * Renders a semantic `<aside>` element.
 */
export const SidebarRoot = ({
  isOpen,
  className = "",
  ...rest
}: SidebarProps) => {
  const { isOpen: contextIsOpen, setIsOpen } = useSidebar();
  const finalIsOpen = isOpen ?? contextIsOpen;

  useEffect(() => {
    if (isOpen !== undefined) {
      setIsOpen(isOpen);
    }
  }, [isOpen, setIsOpen, contextIsOpen]);

  return (
    <>
      <SidebarBaseRoot
        className={cx("scnx-sidebar", className)}
        isOpen={finalIsOpen}
        {...rest}
      />
      <SidebarFlyout />
    </>
  );
};

SidebarRoot.displayName = "SidebarRoot";
