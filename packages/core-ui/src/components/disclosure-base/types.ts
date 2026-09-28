import type { ReactNode } from "react";

/**
 * Disclosure Registry State.
 */
export type DisclosureItemState = {
  isOpen: boolean;
  isClosing: boolean;
  orchestrated?: boolean;
};

export type DisclosureState = Record<string, DisclosureItemState>;

/**
 * Listener Map for Item-specific callbacks.
 */
export type DisclosureListeners = Map<
  string,
  ((state: DisclosureItemState) => void)[]
>;

/**
 * Configuration for the Disclosure Registry Engine.
 */
export type DisclosureRegistryOptions = {
  /** Mode: single (one open at a time) or multiple (many open) */
  type?: "single" | "multiple";
  /** Internal: Full registry override (Advanced) */
  registry?: DisclosureState;
  /** Internal: Initial registry override (Advanced) */
  defaultRegistry?: DisclosureState;
  /** Internal: Registry change callback (Advanced) */
  onRegistryChange?: (registry: DisclosureState) => void;
  /** Whether to disable global animations */
  disabledAnimations?: boolean;
};

export type DisclosureStateContextValue = {
  registry: DisclosureState;
};

export type DisclosureAPIContextValue = {
  defaultId?: string;
  disabledAnimations?: boolean;
  setRegistryItem: (id: string, state: Partial<DisclosureItemState>) => void;
  detachRegistryItem: (id: string) => void;
  regItemListener: (id: string, callback: (state: DisclosureItemState) => void) => () => void;
  unregItemListener: (id: string, callback: (state: DisclosureItemState) => void) => void;
};

/**
 * Combined Context (for legacy/convenience usage)
 */
export type DisclosureContextValue = DisclosureStateContextValue & DisclosureAPIContextValue;

/**
 * Generic Props for the Disclosure Provider.
 */
export type DisclosureProviderProps = DisclosureRegistryOptions & {
  children: ReactNode;
};
