import type {
  NavigationBarBaseCenterProps,
  NavigationBarBaseEndProps,
  NavigationBarBaseLinkProps,
  NavigationBarBaseRootProps,
  NavigationBarBaseStartProps,
} from "@scnx/core-ui/components/navigation-bar-base";

export type NavbarProps = NavigationBarBaseRootProps & {
  /** `floating` is the menu material, inset from the viewport: the marketing and documentation header. @default "default" */
  variant?: "default" | "floating";
};

export type NavbarStartProps = NavigationBarBaseStartProps;

export type NavbarCenterProps = NavigationBarBaseCenterProps;

export type NavbarEndProps = NavigationBarBaseEndProps;

export type NavbarLinkProps = NavigationBarBaseLinkProps;
