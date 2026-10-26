import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../../utils/floating/position";
import type { OpenStateProps } from "../../utils/floating/useOpenState";

export type MenuBaseProps = OpenStateProps & {
  /** The side of the trigger the menu takes; it flips when that side has no room. @default "bottom-start" */
  placement?: FloatingPlacement;
  children?: ReactNode;
};

/** A native button, or with `asChild` its single child, that opens the menu and names it. */
export type MenuBaseTriggerProps =
  | (Omit<ComponentPropsWithRef<"button">, "type"> & { asChild?: false })
  | { asChild: true; children: ReactElement };

/** The menu, rendered only while open. */
export type MenuBaseContentProps = Omit<ComponentPropsWithRef<"div">, "role" | "id">;

export type MenuBaseItemProps = Omit<ComponentPropsWithRef<"div">, "role" | "onSelect"> & {
  /** Runs the command; the menu then closes and focus returns to the trigger, unless the handler calls `event.preventDefault()`. */
  onSelect?: (event: MouseEvent<HTMLDivElement>) => void;
  /** Shown but skipped by the arrow keys and type-ahead, and never run. @default false */
  disabled?: boolean;
  /** The text type-ahead matches; defaults to the item's text. */
  textValue?: string;
};

export type MenuBaseGroupProps = Omit<ComponentPropsWithRef<"div">, "role">;
export type MenuBaseLabelProps = ComponentPropsWithRef<"div">;
export type MenuBaseSeparatorProps = Omit<ComponentPropsWithRef<"div">, "role" | "children">;
