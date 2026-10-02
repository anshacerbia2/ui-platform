"use client";

// Public surface: item state for custom parts and the prop types. The
// registry store and its mutation stay internal (TDD primitives).
export type { DisclosureProviderProps, DisclosureItemOptions, DisclosureItemContextValue } from "./types";
export { useDisclosureItem } from "./DisclosureContext";
