import type { MenuBaseItemProps } from "@scnx/core-ui/components/menu-base";
import type { ReactNode } from "react";

export type {
  MenuBaseContentProps as MenuContentProps,
  MenuBaseGroupProps as MenuGroupProps,
  MenuBaseLabelProps as MenuLabelProps,
  MenuBaseProps as MenuProps,
  MenuBaseSeparatorProps as MenuSeparatorProps,
  MenuBaseTriggerProps as MenuTriggerProps,
} from "@scnx/core-ui/components/menu-base";

export type MenuItemProps = MenuBaseItemProps & {
  /** A 16px icon before the label; decorative. */
  icon?: ReactNode;
  /** The command's shortcut after the label, such as Kbd keys; visual only, so also set `aria-keyshortcuts` (for example "R") on the item. */
  shortcut?: ReactNode;
  /** `danger` marks a destructive command, which should open a confirming Dialog. @default "default" */
  variant?: "default" | "danger";
};
