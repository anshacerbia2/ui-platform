import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` while rendering on the server and while hydrating, `true` after
 * hydration and in client-only renders. React runs `getServerSnapshot` only on
 * the server and during hydration, so the server markup and the first client
 * render agree. Internal: not a public entry.
 *
 * Library code uses it to keep computed values out of server markup, where a
 * strict CSP blocks `style` attributes (TDD theme THM-009).
 */
export const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
