"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DisclosureItemState,
  DisclosureState,
  DisclosureListeners,
  DisclosureRegistryOptions,
  DisclosureContextValue,
  DisclosureStateContextValue,
  DisclosureAPIContextValue,
  DisclosureProviderProps,
} from "./types";

const DisclosureStateContext = createContext<DisclosureStateContextValue | null>(null);
DisclosureStateContext.displayName = "DisclosureStateContext";

const DisclosureAPIContext = createContext<DisclosureAPIContextValue | null>(null);
DisclosureAPIContext.displayName = "DisclosureAPIContext";

const DisclosureIdContext = createContext<string | null>(null);
DisclosureIdContext.displayName = "DisclosureIdContext";

/**
 * Central Orchestrator:
 * Manages the state registry for one or many items.
 */
export const useDisclosureRegistryContextValue = ({
  type = "single",
  defaultRegistry = {},
  registry: controlledRegistry,
  disabledAnimations = true,
  onRegistryChange,
}: DisclosureRegistryOptions): { state: DisclosureStateContextValue; api: DisclosureAPIContextValue } => {
  const [uncontrolledRegistry, setUncontrolledRegistry] =
    useState<DisclosureState>(defaultRegistry);

  const isControlled = controlledRegistry !== undefined;
  const registry = isControlled ? controlledRegistry : uncontrolledRegistry;

  /**
   * Ref Persistence for Registry & Listeners.
   * We use a Ref for listeners to avoid re-creating handlers when listeners are added.
   */
  const registryRef = useRef(registry);
  const onRegistryChangeRef = useRef(onRegistryChange);
  const listenersRef = useRef<DisclosureListeners>(new Map());

  registryRef.current = registry;
  onRegistryChangeRef.current = onRegistryChange;

  /**
   * Listener Subscription:
   * Explicitly unregisters a callback for a specific ID.
   */
  const unregItemListener = useCallback(
    (id: string, callback: (state: DisclosureItemState) => void) => {
      const callbacks = listenersRef.current.get(id);
      
      if (!callbacks) return;

      const nextCallbacks = callbacks.filter((cb) => cb !== callback);
      
      if (nextCallbacks.length === 0) {
        listenersRef.current.delete(id);
      } else {
        listenersRef.current.set(id, nextCallbacks);
      }
    },
    []
  );

  /**
   * Listener Subscription:
   * Registers a callback and returns a Disposer.
   * 
   * @NOTE
   * [LIFECYCLE ADVISORY] For React components, this is best used inside `useEffect`
   * where the disposer can be returned for automatic cleanup on unmount.
   */
  const regItemListener = useCallback(
    (id: string, callback: (state: DisclosureItemState) => void) => {
      const callbacks = listenersRef.current.get(id) || [];
      listenersRef.current.set(id, [...callbacks, callback]);

      /**
       * [RACE CONDITION PROTECTION]
       * If the item is already registered when the listener arrives (common due to useEffect order),
       * we trigger the callback immediately with the current state to ensure the consumer 
       * is synchronized with the initial mount state.
       */
      const currentState = registryRef.current[id];
      if (currentState) {
        callback(currentState);
      }

      // Return a stable disposer using the explicit unregItemListener method
      return () => unregItemListener(id, callback);
    },
    [unregItemListener]
  );

  /**
   * High-Performance Registry Updater.
   * Implements 'Orchestration Isolation' - single mode only affects choreographed items.
   */
  const setRegistryItem = useCallback(
    (id: string, newState: Partial<DisclosureItemState>) => {
      const currentRegistry = registryRef.current;
      const prevItem = currentRegistry[id] || {
        isOpen: false,
        isClosing: false,
        orchestrated: false,
      };
      const mergedItem = { ...prevItem, ...newState };
      let nextRegistry: DisclosureState;

      // Orchestration Logic (Single Mode)
      if (
        type === "single" &&
        mergedItem.isOpen &&
        !prevItem.isOpen &&
        mergedItem.orchestrated
      ) {
        nextRegistry = Object.keys(currentRegistry).reduce((acc, itemId) => {
          if (itemId === id) {
            return { ...acc, [id]: mergedItem };
          }

          const otherItem = currentRegistry[itemId];

          // Only close other items that ARE orchestrated and currently open
          if (otherItem?.orchestrated && otherItem?.isOpen) {
            return {
              ...acc,
              [itemId]: {
                ...otherItem,
                isOpen: false,
                isClosing: !disabledAnimations,
              },
            };
          }

          return { ...acc, [itemId]: otherItem };
        }, {} as DisclosureState);
      } else {
        // Multiple mode or Non-orchestrated change or Closing action
        nextRegistry = {
          ...currentRegistry,
          [id]: mergedItem,
        };
      }

      if (!isControlled) {
        setUncontrolledRegistry(nextRegistry);
      }

      onRegistryChangeRef.current?.(nextRegistry);

      // Trigger Listeners for all changed IDs ONLY if they have active listeners.
      Object.keys(nextRegistry).forEach((itemId) => {
        if (nextRegistry[itemId] !== currentRegistry[itemId]) {
          const callbacks = listenersRef.current.get(itemId);
          if (callbacks && callbacks.length > 0) {
            callbacks.forEach((cb) => cb(nextRegistry[itemId]));
          }
        }
      });
    },
    [type, isControlled, disabledAnimations]
  );

  /**
   * Registry Cleanup:
   * Removes an item from the registry when its owner component unmounts.
   */
  const detachRegistryItem = useCallback(
    (id: string) => {
      const currentRegistry = registryRef.current;
      if (!currentRegistry[id]) return;

      const { [id]: _, ...nextRegistry } = currentRegistry;

      if (!isControlled) {
        setUncontrolledRegistry(nextRegistry);
      }

      onRegistryChangeRef.current?.(nextRegistry);

      // Also cleanup listeners using optimized Map engine
      listenersRef.current.delete(id);
    },
    [isControlled]
  );

  const state = useMemo(() => ({ registry }), [registry]);

  const api = useMemo(
    () => ({
      setRegistryItem,
      regItemListener,
      unregItemListener,
      detachRegistryItem,
      disabledAnimations,
    }),
    [
      setRegistryItem,
      regItemListener,
      unregItemListener,
      detachRegistryItem,
      disabledAnimations,
    ]
  );

  return useMemo(() => ({ state, api }), [state, api]);
};

/**
 * Internal Hook: Accesses only the stable API methods.
 * Components using this will NOT re-render on registry state changes.
 */
export const useDisclosureAPI = () => {
  const context = useContext(DisclosureAPIContext);
  if (!context) {
    throw new Error("useDisclosureAPI must be used within a DisclosureProvider");
  }
  return context;
};

/**
 * Internal Hook: Accesses the entire registry state.
 * Components using this WILL re-render on ANY registry change.
 */
export const useDisclosureState = () => {
  const context = useContext(DisclosureStateContext);
  if (!context) {
    throw new Error("useDisclosureState must be used within a DisclosureProvider");
  }
  return context;
};

/**
 * Global Hook (Global Truth):
 * Returns the stable API and the entire registry state.
 * 
 * @NOTE
 * Components using this will re-render on ANY registry change.
 * Use useDisclosureItem() for optimized atomic updates.
 */
export const useDisclosure = () => {
  const state = useDisclosureState();
  const api = useDisclosureAPI();
  
  return useMemo(() => ({ ...state, ...api }), [state, api]);
};

/**
 * Atomic/Surgical Subscription Hook.
 * 
 * This is the 'Enterprise' hook that ensures only the relevant component 
 * re-renders when state changes. It bypasses global context re-renders 
 * by using a local state + event listener model.
 */
export const useDisclosureItem = () => {
  const {
    setRegistryItem,
    regItemListener,
    unregItemListener,
    detachRegistryItem,
    disabledAnimations,
  } = useDisclosureAPI();

  const itemId = useContext(DisclosureIdContext);

  if (itemId === null) {
    throw new Error(
      "useDisclosureItem: This hook must be used within a component that provides DisclosureIdContext (e.g., CollapsibleBaseRoot or AccordionItem)."
    );
  }

  // 1. Atomic Local State
  const [itemState, setItemState] = useState<DisclosureItemState>({
    isOpen: false,
    isClosing: false,
    orchestrated: false,
  });

  // 2. Surgical Subscription
  useEffect(() => {
    // regItemListener automatically triggers current state on mount (Behavioral Sync)
    const disposer = regItemListener(itemId, (nextState) => {
      setItemState(nextState);
    });
    return disposer;
  }, [itemId, regItemListener]);

  const setDisclosureState = useCallback(
    (newState: Partial<DisclosureItemState>) =>
      setRegistryItem(itemId, newState),
    [setRegistryItem, itemId]
  );

  const toggle = useCallback(() => {
    const { isOpen, isClosing } = itemState;

    // Case 1: Settled Open -> Intent: Close
    if (isOpen && !isClosing) {
      if (disabledAnimations) {
        setDisclosureState({ isOpen: false, isClosing: false });
      } else {
        setDisclosureState({ isClosing: true });
      }
      return;
    }

    // Case 2: Currently Exiting (Momentum Reversal) -> Intent: Re-open
    if (isOpen && isClosing) {
      setDisclosureState({ isClosing: false });
      return;
    }

    // Case 3: Settled Closed -> Intent: Open
    if (!isOpen && !isClosing) {
      setDisclosureState({ isOpen: true, isClosing: false });
      return;
    }

    // Case 4: Stalled/Closing but hidden -> Intent: Sanitary Open
    if (!isOpen && isClosing) {
      setDisclosureState({ isClosing: false });
      return;
    }
  }, [itemState, setDisclosureState, disabledAnimations]);

  return {
    ...itemState,
    setDisclosureState,
    toggle,
    id: itemId,
    disabledAnimations,
    regItemListener,
    unregItemListener,
    detachRegistryItem,
  };
};

/**
 * Provides Registry State Management.
 */
export const DisclosureProvider = ({
  children,
  ...options
}: DisclosureProviderProps) => {
  const { state, api } = useDisclosureRegistryContextValue(options);

  return (
    <DisclosureAPIContext.Provider value={api}>
      <DisclosureStateContext.Provider value={state}>
        {children}
      </DisclosureStateContext.Provider>
    </DisclosureAPIContext.Provider>
  );
};
DisclosureProvider.displayName = "DisclosureProvider";

/**
 * Provides Scoped Item ID.
 */
export const DisclosureIdProvider = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  return (
    <DisclosureIdContext value={id}>
      {children}
    </DisclosureIdContext>
  );
};
DisclosureIdProvider.displayName = "DisclosureIdProvider";

/**
 * Internal hook to safe-check context without throwing.
 */
export const useHasDisclosureContext = () => !!useContext(DisclosureAPIContext);

/**
 * Professional Unique ID Generator:
 * Recursively checks the registry to ensure NO collisions in the DOM.
 */
export const generateUniqueId = (
  registry: DisclosureState,
  prefix?: string
): string => {
  const p = prefix ? `${prefix}-` : "";
  const id = `${p}${Math.random().toString(36).substring(2, 11)}`;
  if (registry[id]) return generateUniqueId(registry, prefix);
  return id;
};
