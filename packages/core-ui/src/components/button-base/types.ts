import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, Ref } from "react";

export type ButtonBaseCommonProps = {
  /** The children to render. */
  children?: ReactNode;
  /** Custom CSS classes. */
  className?: string;
  /**
   * Button mode: the native `disabled`. Link and `asChild` modes: removes
   * navigation, sets `aria-disabled`, leaves sequential focus, and cancels
   * activation.
   */
  disabled?: boolean;
};

/** Native `<button type="button">`; `pressed` makes it a toggle (`aria-pressed`). */
export type ButtonModeProps = ButtonBaseCommonProps &
  Omit<ComponentPropsWithRef<"button">, keyof ButtonBaseCommonProps> & {
    /** Toggle state, rendered as `aria-pressed`. */
    pressed?: boolean;
    href?: undefined;
    asChild?: false;
  };

/** Native `<a href>`; link semantics are kept, never `role="button"`. */
export type AnchorModeProps = ButtonBaseCommonProps &
  Omit<ComponentPropsWithRef<"a">, keyof ButtonBaseCommonProps | "href"> & {
    /** Destination; a link always has one. */
    href: string;
    asChild?: false;
  };

/** Composes one child element, for example a router Link (TDD primitives, Polymorphism). */
export type ChildModeProps = ButtonBaseCommonProps &
  Omit<HTMLAttributes<HTMLElement>, keyof ButtonBaseCommonProps> & {
    asChild: true;
    children: ReactElement;
    ref?: Ref<HTMLElement>;
  };

export type ButtonBaseProps = ButtonModeProps | AnchorModeProps | ChildModeProps;
