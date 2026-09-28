import type { 
  AnchorHTMLAttributes, 
  ButtonHTMLAttributes, 
  ComponentPropsWithRef,
  ReactNode, 
} from "react";

export type ButtonBaseCommonProps = {
  /** The children to render. */
  children?: ReactNode;
  /** Custom CSS classes. */
  className?: string;
  /** Whether the element is disabled. */
  disabled?: boolean;
  /** Whether the button is in a pressed state (for toggles). */
  pressed?: boolean;
};

export type ButtonModeProps = ButtonBaseCommonProps & 
  Omit<ComponentPropsWithRef<"button">, keyof ButtonBaseCommonProps>;

export type AnchorModeProps = ButtonBaseCommonProps & 
  Omit<ComponentPropsWithRef<"a">, keyof ButtonBaseCommonProps> & {
    /** Target URL. */
    href: string;
  };

export type ButtonBaseProps = ButtonModeProps | AnchorModeProps;
