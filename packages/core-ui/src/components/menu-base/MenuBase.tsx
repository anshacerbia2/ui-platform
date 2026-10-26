import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { Slot, composeRefs } from "../../utils/Slot";
import { FloatingPortal, useDismiss, useFloating, useOpenState } from "../../utils/floating";
import type {
  MenuBaseContentProps,
  MenuBaseGroupProps,
  MenuBaseItemProps,
  MenuBaseLabelProps,
  MenuBaseProps,
  MenuBaseSeparatorProps,
  MenuBaseTriggerProps,
} from "./types";

// Type-ahead keeps the typed characters this long between key presses.
const TYPEAHEAD_RESET = 500;

type FocusTarget = "first" | "last";

type MenuContextValue = {
  open: boolean;
  openWith: (target: FocusTarget) => void;
  close: () => void;
  triggerId: string;
  contentId: string;
  trigger: HTMLElement | null;
  setTrigger: (node: HTMLElement | null) => void;
  content: HTMLElement | null;
  setContent: (node: HTMLElement | null) => void;
  focusTarget: FocusTarget;
  placement: NonNullable<MenuBaseProps["placement"]>;
};
const MenuContext = createContext<MenuContextValue | null>(null);

const useMenu = (part: string): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) throw new Error(`MenuBase.${part} must be rendered inside MenuBase`);
  return context;
};

/** The menu's enabled items, in order. */
const itemsOf = (content: HTMLElement): HTMLElement[] => [...content.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')];

/**
 * MenuBase - commands for its trigger (APG menu button pattern; TDD
 * primitives P34). The trigger opens the menu: Enter, Space, ArrowDown, and a
 * click focus the first item, ArrowUp the last. In the menu, ArrowDown and
 * ArrowUp move between enabled items and wrap, Home and End go to the ends,
 * and typing jumps to the next item whose text starts with what was typed. A
 * pointer moving over an item focuses it. Enter, Space, or a click runs an
 * item's `onSelect`; the menu then closes and focus returns to the trigger.
 * Escape and Tab close it the same way; a press outside closes it without
 * moving focus. Disabled items are shown, skipped, and never run. The menu
 * renders into the theme provider's portal container.
 *
 * @example
 * ```tsx
 * <MenuBase>
 *   <MenuBase.Trigger>Actions</MenuBase.Trigger>
 *   <MenuBase.Content>
 *     <MenuBase.Item onSelect={rename}>Rename</MenuBase.Item>
 *     <MenuBase.Separator />
 *     <MenuBase.Item onSelect={remove}>Delete</MenuBase.Item>
 *   </MenuBase.Content>
 * </MenuBase>
 * ```
 */
const MenuBaseRoot = ({ placement = "bottom-start", children, ...openState }: MenuBaseProps): ReactElement => {
  const [open, setOpen] = useOpenState(openState);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>("first");
  const triggerId = useId();
  const contentId = useId();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  useDismiss(open, [trigger, content], () => setOpen(false));
  const context = useMemo(
    () => ({
      open,
      openWith: (target: FocusTarget) => {
        setFocusTarget(target);
        setOpen(true);
      },
      close: () => setOpen(false),
      triggerId,
      contentId,
      trigger,
      setTrigger,
      content,
      setContent,
      focusTarget,
      placement,
    }),
    [open, setOpen, triggerId, contentId, trigger, content, focusTarget, placement],
  );
  return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>;
};

/** Opens the menu and names it; a native button unless `asChild`. */
const MenuBaseTrigger = (props: MenuBaseTriggerProps): ReactElement => {
  const { open, openWith, close, triggerId, contentId, setTrigger } = useMenu("Trigger");
  const shared = {
    id: triggerId,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    "data-state": open ? "open" : "closed",
    onClick: () => (open ? close() : openWith("first")),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const target = event.key === "ArrowUp" ? "last" : ["ArrowDown", "Enter", " "].includes(event.key) ? "first" : null;
      if (!target) return;
      // Enter and Space would also click the button; the key opens the menu once.
      event.preventDefault();
      openWith(target);
    },
  };
  if (props.asChild) {
    return (
      <Slot ref={setTrigger} {...shared}>
        {props.children}
      </Slot>
    );
  }
  const { asChild: _, ref, onClick, onKeyDown, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      {...shared}
      ref={composeRefs(setTrigger, ref)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) shared.onClick();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) shared.onKeyDown(event);
      }}
    />
  );
};

/** The menu, rendered only while open. */
const MenuBaseContent = ({ ref, onKeyDown, ...props }: MenuBaseContentProps): ReactElement | null => {
  const { open, close, triggerId, contentId, trigger, content, setContent, focusTarget, placement } = useMenu("Content");
  const typed = useRef({ text: "", at: 0 });
  useFloating(open, trigger, content, { placement });
  useEffect(() => {
    if (!open || !content) return;
    const items = itemsOf(content);
    ((focusTarget === "last" ? items.at(-1) : items[0]) ?? content).focus({ preventScroll: true });
    return () => {
      // The menu is gone: focus that was in it fell to the body.
      const active = document.activeElement;
      if (!active || active === document.body || content.contains(active)) trigger?.focus({ preventScroll: true });
    };
  }, [open, content, trigger, focusTarget]);
  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !content) return;
    const items = itemsOf(content);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => {
      event.preventDefault();
      items[(to + items.length) % items.length]?.focus();
    };
    if (event.key === "ArrowDown") return move(index + 1);
    if (event.key === "ArrowUp") return move(index === -1 ? -1 : index - 1);
    if (event.key === "Home") return move(0);
    if (event.key === "End") return move(-1);
    if (event.key === "Tab") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = event.timeStamp;
      typed.current = { text: (now - typed.current.at < TYPEAHEAD_RESET ? typed.current.text : "") + event.key.toLowerCase(), at: now };
      const text = typed.current.text;
      // One repeated character cycles through the items that start with it.
      const query = [...text].every((c) => c === text[0]) ? text[0] : text;
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
      const match = ordered.find((item) => (item.dataset.textValue ?? item.textContent ?? "").trim().toLowerCase().startsWith(query));
      if (match) {
        event.preventDefault();
        match.focus();
      }
    }
  };

  return (
    <FloatingPortal name="MenuBase">
      <div
        tabIndex={-1}
        {...props}
        ref={composeRefs(setContent, ref)}
        role="menu"
        id={contentId}
        aria-labelledby={triggerId}
        data-state="open"
        onKeyDown={handleKeyDown}
      />
    </FloatingPortal>
  );
};

/** One command: focusable by the menu's keys and the pointer, run by Enter, Space, or a click. */
const MenuBaseItem = ({ onSelect, disabled = false, textValue, onClick, onKeyDown, onPointerMove, ...props }: MenuBaseItemProps): ReactElement => {
  const { close } = useMenu("Item");
  return (
    <div
      tabIndex={-1}
      {...props}
      role="menuitem"
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      data-text-value={textValue}
      onClick={(event) => {
        onClick?.(event);
        if (disabled || event.defaultPrevented) return;
        onSelect?.(event);
        if (!event.defaultPrevented) close();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        event.currentTarget.click();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
      }}
    />
  );
};

type GroupContextValue = { labelId: string };
const GroupContext = createContext<GroupContextValue | null>(null);

/** Related items, named by their Label. */
const MenuBaseGroup = (props: MenuBaseGroupProps): ReactElement => {
  const labelId = useId();
  return (
    <GroupContext.Provider value={{ labelId }}>
      <div aria-labelledby={labelId} {...props} role="group" />
    </GroupContext.Provider>
  );
};

/** A group's name; not an item. */
const MenuBaseLabel = (props: MenuBaseLabelProps): ReactElement => {
  const group = useContext(GroupContext);
  return <div id={group?.labelId} {...props} />;
};

/** A line between items. */
const MenuBaseSeparator = (props: MenuBaseSeparatorProps): ReactElement => <div {...props} role="separator" />;

MenuBaseRoot.displayName = "MenuBase";
MenuBaseTrigger.displayName = "MenuBase.Trigger";
MenuBaseContent.displayName = "MenuBase.Content";
MenuBaseItem.displayName = "MenuBase.Item";
MenuBaseGroup.displayName = "MenuBase.Group";
MenuBaseLabel.displayName = "MenuBase.Label";
MenuBaseSeparator.displayName = "MenuBase.Separator";

export const MenuBase = Object.assign(MenuBaseRoot, {
  Trigger: MenuBaseTrigger,
  Content: MenuBaseContent,
  Item: MenuBaseItem,
  Group: MenuBaseGroup,
  Label: MenuBaseLabel,
  Separator: MenuBaseSeparator,
});
