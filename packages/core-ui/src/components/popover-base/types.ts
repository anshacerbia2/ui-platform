import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../../utils/floating/position";
import type { OpenStateProps } from "../../utils/floating/useOpenState";

export type PopoverBaseProps = OpenStateProps & {
  /** The side of the trigger the popover takes; it flips when that side has no room. @default "bottom-start" */
  placement?: FloatingPlacement;
  children?: ReactNode;
};

/** A native button, or with `asChild` its single child, that opens and closes the popover. */
export type PopoverBaseTriggerProps =
  | (Omit<ComponentPropsWithRef<"button">, "type"> & { asChild?: false })
  | { asChild: true; children: ReactElement };

/** The popover: a non-modal dialog, named by its Title. */
export type PopoverBaseContentProps = Omit<ComponentPropsWithRef<"div">, "role" | "id">;

export type PopoverBaseTitleProps = Omit<ComponentPropsWithRef<"h2">, "id">;

/** Closes the popover: a native button, or with `asChild` its single child, such as a styled Button. */
export type PopoverBaseCloseProps =
  | (Omit<ComponentPropsWithRef<"button">, "type"> & { asChild?: false })
  | { asChild: true; children: ReactElement };
