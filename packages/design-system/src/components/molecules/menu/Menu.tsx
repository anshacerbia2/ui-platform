import { MenuBase } from "@scnx/core-ui/components/menu-base";
import { cx } from "styled-system/css";
import type { MenuContentProps, MenuItemProps, MenuLabelProps, MenuProps, MenuSeparatorProps } from "./types";

/**
 * Menu - commands for its trigger, on MenuBase (APG menu button): the menu
 * material with 32px rows; choosing one runs it and closes the menu. Choosing
 * a value is a Select; a destructive command opens a confirming Dialog. Needs
 * a ThemeProvider, whose portal container it renders into.
 *
 * @example
 * ```tsx
 * import { Menu } from "@scnx/system/components/menu";
 *
 * <Menu>
 *   <Menu.Trigger asChild><IconButton aria-label="More actions">⋯</IconButton></Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Item icon={<EditIcon />} shortcut={<Kbd>R</Kbd>} onSelect={rename}>Rename</Menu.Item>
 *     <Menu.Separator />
 *     <Menu.Item variant="danger" onSelect={confirmDelete}>Delete</Menu.Item>
 *   </Menu.Content>
 * </Menu>
 * ```
 */
const MenuRoot = (props: MenuProps) => <MenuBase {...props} />;

const MenuContent = ({ className, ...props }: MenuContentProps) => <MenuBase.Content {...props} className={cx("scnx-menu", className)} />;

const MenuItem = ({ icon, shortcut, variant = "default", children, ...props }: MenuItemProps) => (
  <MenuBase.Item data-part="item" data-variant={variant} {...props}>
    {icon && (
      <span data-part="icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
    {shortcut && (
      // Visual: the item's name is its label; aria-keyshortcuts on the item names the keys.
      <span data-part="shortcut" aria-hidden="true">
        {shortcut}
      </span>
    )}
  </MenuBase.Item>
);

const MenuLabel = (props: MenuLabelProps) => <MenuBase.Label data-part="label" {...props} />;

const MenuSeparator = (props: MenuSeparatorProps) => <MenuBase.Separator data-part="separator" {...props} />;

MenuRoot.displayName = "Menu";
MenuContent.displayName = "Menu.Content";
MenuItem.displayName = "Menu.Item";
MenuLabel.displayName = "Menu.Label";
MenuSeparator.displayName = "Menu.Separator";

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuBase.Trigger,
  Content: MenuContent,
  Item: MenuItem,
  Group: MenuBase.Group,
  Label: MenuLabel,
  Separator: MenuSeparator,
});
