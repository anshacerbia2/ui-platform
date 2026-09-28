"use client";

import { createContext as reactCreateContext, useContext } from "react";

/**
 * Creates a constrained React context with strict out-of-context guards.
 * 
 * @param componentName - The name of the component(s) that use this context (for error reporting).
 * @returns A tuple of [Provider, useHook] where useHook throws an error if used outside Provider.
 * 
 * @example
 * const [MyProvider, useMyContext] = createContext<MyValue>("MyComponent");
 */
export const createContext = <ContextValueType,>(componentName: string) => {
  const Context = reactCreateContext<ContextValueType | undefined>(undefined);

  const useHook = (consumerName?: string) => {
    const context = useContext(Context);
    if (context) return context;

    throw new Error(
      `[${consumerName || componentName}] must be used within a [${componentName}] component.`
    );
  };

  return [Context, useHook] as const;
};
