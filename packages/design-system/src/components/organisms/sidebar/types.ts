import type { ReactNode } from "react";

import type {
  SidebarBaseFooterProps,
  SidebarBaseHeaderProps,
  SidebarBaseNavProps,
  SidebarBaseRootProps,
  SidebarBaseToggleProps,
} from "@scnx/core-ui/components/sidebar-base";

export type FlyoutState = {
  ownerId: string;
  triggerRef: HTMLElement | null;
  content: ReactNode | null;
};

export type SidebarContextValue = {
  /** ID of the sidebar root, for the toggle's aria-controls. */
  sidebarId: string;
  activePath: string;
  isOpen: boolean;
  expandedMap: Record<string, boolean>;
  setIsOpen: (value: boolean) => void;
  toggleOpen: () => void;
  setExpanded: (id: string, value: boolean) => void;
  toggleExpanded: (id: string) => void;
};

export type FlyoutContextValue = {
  activeFlyout: FlyoutState | null;
  isFlyoutClosing: boolean;
  setFlyout: (
    ownerId: string,
    triggerRef: HTMLElement,
    content: ReactNode,
  ) => void;
  closeFlyout: () => void;
  cleanupFlyout: () => void;
};

export type SidebarProps = {
  /** Visual variant of the sidebar. */
  variant?: "dark" | "light";
} & SidebarBaseRootProps;

export type SidebarProviderProps = {
  children?: ReactNode;
  activePath?: string;
  defaultIsOpen?: boolean;
  withFlyout?: boolean;
};

export type SidebarToggleProps = SidebarBaseToggleProps & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
export type SidebarHeaderProps = SidebarBaseHeaderProps;
export type SidebarNavProps = SidebarBaseNavProps;
export type SidebarFooterProps = SidebarBaseFooterProps;

export type SidebarFlyoutProps = {
  className?: string;
  width?: string | number;
  variant?: "dark" | "light";
};

export type NavigableChildProps = {
  to?: string;
  href?: string;
  children?: ReactNode;
};
