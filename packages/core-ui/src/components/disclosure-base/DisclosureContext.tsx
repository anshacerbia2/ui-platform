import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createDisclosureStore, type DisclosureStore } from "./store";
import type { DisclosureItemContextValue, DisclosureItemOptions, DisclosureProviderProps } from "./types";

const StoreContext = createContext<DisclosureStore | null>(null);
StoreContext.displayName = "DisclosureStoreContext";

const ItemContext = createContext<DisclosureItemContextValue | null>(null);
ItemContext.displayName = "DisclosureItemContext";

const toArray = (value: string | string[] | undefined): string[] | undefined =>
  value === undefined ? undefined : Array.isArray(value) ? value : value === "" ? [] : [value];

/** Development diagnostic for a component contract (TDD primitives, Observability). */
const diagnose = (component: string, message: string) => console.error(`${component}: ${message}`);

/** Warn once when a prop switches between controlled and uncontrolled (PRM-003). */
function useModeSwitchWarning(component: string, prop: string, controlled: boolean) {
  const initial = useRef(controlled);
  useEffect(() => {
    if (initial.current !== controlled) {
      diagnose(component, `\`${prop}\` switched from ${initial.current ? "controlled" : "uncontrolled"} to ${controlled ? "controlled" : "uncontrolled"}; choose one mode for the component's lifetime.`);
    }
  }, [component, prop, controlled]);
}

/**
 * DisclosureProvider - one scoped registry of disclosure items (TDD
 * primitives, Disclosure and Accordion). Every root creates its own scope;
 * the nearest provider owns an item.
 */
export const DisclosureProvider = ({
  children,
  type = "multiple",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  disabled = false,
  disabledAnimations = false,
}: DisclosureProviderProps & { children: ReactNode }) => {
  const controlledValue = toArray(value);
  const emit = useCallback(
    (next: string[]) => onValueChange?.((type === "single" ? (next[0] ?? "") : next) as never),
    [onValueChange, type],
  );
  const [store] = useState(() =>
    createDisclosureStore({ type, collapsible, disabled, value: controlledValue, onValueChange: emit }, toArray(defaultValue) ?? []),
  );
  // The latest props drive the next intent; the store never reads stale config.
  store.config = { type, collapsible, disabled, value: controlledValue, onValueChange: emit };
  useModeSwitchWarning("DisclosureProvider", "value", value !== undefined);

  return (
    <StoreContext value={store}>
      <AnimationsContext value={disabledAnimations}>{children}</AnimationsContext>
    </StoreContext>
  );
};
DisclosureProvider.displayName = "DisclosureProvider";

const AnimationsContext = createContext(false);

/** The nearest disclosure store; throws a named error outside a provider. */
export function useDisclosureStore(component: string): DisclosureStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error(`${component} must be used within a disclosure root (CollapsibleBase.Root or AccordionBase.Root).`);
  return store;
}

/**
 * DisclosureItemProvider - registers one item and provides its state to its
 * trigger and content. The value is explicit or derived from useId; DOM IDs
 * derive separately as `<instance>-trigger` and `<instance>-content` (PRM-004).
 */
export const DisclosureItemProvider = ({ children, value: explicitValue, open: controlledOpen, defaultOpen = false, onOpenChange, disabled = false }: DisclosureItemOptions & { children: ReactNode }) => {
  const store = useDisclosureStore("DisclosureItem");
  const instance = useId();
  const value = explicitValue ?? instance;
  const itemControlled = controlledOpen !== undefined;
  useModeSwitchWarning("DisclosureItem", "open", itemControlled);

  const storeOpen = useSyncExternalStore(
    store.subscribe,
    () => store.isOpen(value, defaultOpen),
    () => store.isOpen(value, defaultOpen),
  );
  const open = itemControlled ? controlledOpen : storeOpen;
  const itemDisabled = disabled || store.config.disabled;

  const latest = useRef({ onOpenChange, defaultOpen });
  latest.current = { onOpenChange, defaultOpen };

  // Registration with a generation token: a stale cleanup cannot remove a
  // newer registration of the same value; a duplicate live value is rejected.
  useEffect(() => {
    const registration = {
      get defaultOpen() {
        return latest.current.defaultOpen;
      },
      onOpenChange: (next: boolean) => latest.current.onOpenChange?.(next),
    };
    const { accepted, unregister } = store.register(value, registration);
    if (!accepted) diagnose("DisclosureItem", `duplicate item value "${value}"; the second registration is rejected.`);
    return unregister;
  }, [store, value]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (itemControlled) {
        // The parent owns the state: report the accepted intent, change nothing.
        if (!itemDisabled && next !== controlledOpen) latest.current.onOpenChange?.(next);
        return;
      }
      store.request(value, next, { itemDisabled: disabled, defaultOpen: latest.current.defaultOpen });
    },
    [store, value, itemControlled, controlledOpen, itemDisabled, disabled],
  );

  const locked = open && store.config.type === "single" && !store.config.collapsible;
  const disabledAnimations = useContext(AnimationsContext);

  return (
    <ItemContext
      value={{
        value,
        open,
        disabled: itemDisabled,
        locked,
        triggerId: `${instance}-trigger`,
        contentId: `${instance}-content`,
        disabledAnimations,
        setOpen,
        toggle: () => setOpen(!open),
      }}
    >
      {children}
    </ItemContext>
  );
};
DisclosureItemProvider.displayName = "DisclosureItemProvider";

/** The nearest disclosure item: open state, IDs, and intents. Throws a named error outside one. */
export function useDisclosureItem(component = "useDisclosureItem"): DisclosureItemContextValue {
  const item = useContext(ItemContext);
  if (!item) throw new Error(`${component} must be used within a disclosure item (CollapsibleBase.Item or AccordionBase.Item).`);
  return item;
}
