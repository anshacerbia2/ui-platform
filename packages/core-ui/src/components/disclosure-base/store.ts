// Disclosure registry store (TDD primitives: "Controlled-state reducer",
// "Single Accordion update", registration generations; PRM-003, PRM-008).
//
// Updates are synchronous on the store's current state, so two intents in
// one tick both apply (the baseline's render-time registry ref lost one).
// Registrations carry a token; a stale cleanup cannot remove a newer
// registration of the same value.

export type DisclosureType = "single" | "multiple";

export type DisclosureStoreConfig = {
  type: DisclosureType;
  /** Single mode: whether the only open item may close. */
  collapsible: boolean;
  /** Every item is disabled. */
  disabled: boolean;
  /** Controlled open values; undefined when uncontrolled. */
  value: string[] | undefined;
  onValueChange?: (value: string[]) => void;
};

export type DisclosureRegistration = {
  /** Open state until the value's state is first set. */
  defaultOpen?: boolean;
  /** Fires once per accepted change of this item's open state. */
  onOpenChange?: (open: boolean) => void;
};

export type DisclosureStore = {
  /** The current config; the provider refreshes it every render. */
  config: DisclosureStoreConfig;
  subscribe(listener: () => void): () => void;
  /** Open state of a value; `fallback` applies until the value's state is first set. */
  isOpen(value: string, fallback?: boolean): boolean;
  /** Register an item; a duplicate live value is rejected. */
  register(value: string, registration: DisclosureRegistration): { accepted: boolean; unregister: () => void };
  /** Refresh the registration of a live value. */
  update(value: string, registration: DisclosureRegistration): void;
  /**
   * A user intent to set `value` open or closed; returns whether it was
   * accepted. Disabled items, closing the only item of a non-collapsible
   * single disclosure, and no-ops are rejected.
   */
  request(value: string, open: boolean, options?: { itemDisabled?: boolean; defaultOpen?: boolean }): boolean;
  /** Live registered values, for diagnostics and tests. */
  values(): string[];
};

export function createDisclosureStore(initial: DisclosureStoreConfig, defaultValue: readonly string[] = []): DisclosureStore {
  let open = new Set(defaultValue);
  // Values whose state has been set explicitly; others use their default.
  const known = new Set(defaultValue);
  const items = new Map<string, { token: object; registration: DisclosureRegistration }>();
  const listeners = new Set<() => void>();

  const defaultOf = (value: string) => items.get(value)?.registration.defaultOpen ?? false;

  const store: DisclosureStore = {
    config: initial,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isOpen(value, fallback) {
      const controlled = store.config.value;
      if (controlled) return controlled.includes(value);
      return known.has(value) ? open.has(value) : (fallback ?? defaultOf(value));
    },
    register(value, registration) {
      if (items.has(value)) return { accepted: false, unregister: () => {} };
      const token = {};
      items.set(value, { token, registration });
      return {
        accepted: true,
        unregister: () => {
          if (items.get(value)?.token === token) items.delete(value);
        },
      };
    },
    update(value, registration) {
      const entry = items.get(value);
      if (entry) entry.registration = registration;
    },
    values: () => [...items.keys()],
    request(value, nextOpen, { itemDisabled = false, defaultOpen } = {}) {
      const { type, collapsible, disabled, value: controlled, onValueChange } = store.config;
      if (disabled || itemDisabled) return false;
      const valueOpen = store.isOpen(value, defaultOpen);
      if (valueOpen === nextOpen) return false;
      if (type === "single" && !nextOpen && !collapsible) return false;

      const candidates = new Set([...(controlled ?? []), ...open, ...items.keys(), value]);
      const current = [...candidates].filter((v) => (v === value ? valueOpen : store.isOpen(v)));
      const next = type === "single"
        ? (nextOpen ? [value] : [])
        : (nextOpen ? [...current, value] : current.filter((v) => v !== value));
      const changed = [...new Set([...current, ...next])].filter((v) => current.includes(v) !== next.includes(v));

      if (!controlled) {
        open = new Set(next);
        for (const v of candidates) known.add(v);
        for (const listener of [...listeners]) listener();
      }
      onValueChange?.(next);
      for (const v of changed) items.get(v)?.registration.onOpenChange?.(next.includes(v));
      return true;
    },
  };
  return store;
}
