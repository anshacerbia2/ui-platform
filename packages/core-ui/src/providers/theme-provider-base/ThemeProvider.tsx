import { createContext, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { assertThemeId, createThemeStore, isThemeMode } from "./store";
import type { ThemeContextValue, ThemeMode, ThemeProviderProps, ThemeSnapshot } from "./types";

/** Context of the nearest ThemeProvider; null outside one. */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

const diagnostic = (message: string) => console.error(message);

/**
 * ThemeProvider - scoped theme state for one theme root (TDD theme, THM-001..005).
 *
 * The root carries exactly `data-scnx-theme` and `data-scnx-resolved-mode`.
 * State lives in a store owned by this provider, or in an explicit `store`
 * shared on purpose; there is no global singleton, no `window` API, no
 * injected script or style, and no dynamic code evaluation. The first client
 * render reproduces the server snapshot; persisted and system preference
 * apply after hydration.
 *
 * @example
 * ```tsx
 * <ThemeProvider themeId="default" defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider = ({
  children,
  themeId,
  mode,
  defaultMode,
  onModeChange,
  store: explicitStore,
  storage,
  root: rootElement,
  portalContainer: explicitPortal,
}: ThemeProviderProps) => {
  // Unknown theme: reject the update and keep the last valid ID.
  const validThemeId = useRef<string | null>(null);
  try {
    assertThemeId(themeId);
    validThemeId.current = themeId;
  } catch (error) {
    if (validThemeId.current === null) throw error;
    diagnostic((error as Error).message);
  }
  const activeThemeId = validThemeId.current;

  const [ownedStore] = useState(() =>
    explicitStore ? null : createThemeStore({ themeId: activeThemeId, defaultMode, storage, onDiagnostic: diagnostic }),
  );
  const store = explicitStore ?? ownedStore!;

  const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const system = useSyncExternalStore(store.subscribe, store.getSystemMode, () => null);
  useEffect(() => store.connect(), [store]);

  const controlled = mode !== undefined;
  if (controlled && !isThemeMode(mode)) diagnostic(`ThemeProvider: ignored the invalid controlled mode "${String(mode)}"`);
  const controlledMode = controlled && isThemeMode(mode) ? mode : null;

  const snapshot: ThemeSnapshot = useMemo(() => {
    if (!controlledMode) return { ...stored, themeId: activeThemeId };
    const resolvedMode = controlledMode === "system" ? (system ?? stored.resolvedMode) : controlledMode;
    return { ...stored, themeId: activeThemeId, mode: controlledMode, resolvedMode, source: "controlled" };
  }, [stored, system, controlledMode, activeThemeId]);

  const onModeChangeRef = useRef(onModeChange);
  useEffect(() => {
    onModeChangeRef.current = onModeChange;
  });

  const setMode = useCallback(
    (next: ThemeMode) => {
      if (!isThemeMode(next)) {
        diagnostic(`ThemeProvider: rejected the invalid mode "${String(next)}"`);
        return;
      }
      if (controlledMode) {
        const resolvedMode = next === "system" ? (store.getSystemMode() ?? "light") : next;
        onModeChangeRef.current?.(next, { ...snapshot, mode: next, resolvedMode, revision: snapshot.revision });
        return;
      }
      store.setMode(next);
      onModeChangeRef.current?.(next, { ...store.getSnapshot(), themeId: activeThemeId });
    },
    [controlledMode, store, snapshot, activeThemeId],
  );

  // An existing root element receives the attributes; prior values are restored.
  useEffect(() => {
    if (!rootElement) return;
    const previous = ["data-scnx-theme", "data-scnx-resolved-mode"].map((name) => [name, rootElement.getAttribute(name)] as const);
    rootElement.setAttribute("data-scnx-theme", snapshot.themeId);
    rootElement.setAttribute("data-scnx-resolved-mode", snapshot.resolvedMode);
    return () => {
      for (const [name, value] of previous) {
        if (value === null) rootElement.removeAttribute(name);
        else rootElement.setAttribute(name, value);
      }
    };
  }, [rootElement, snapshot.themeId, snapshot.resolvedMode]);

  const [renderedRoot, setRenderedRoot] = useState<HTMLDivElement | null>(null);
  const [ownedPortal, setOwnedPortal] = useState<HTMLDivElement | null>(null);
  const root = rootElement ?? renderedRoot;
  const portalContainer = explicitPortal ?? ownedPortal;

  const value: ThemeContextValue = useMemo(
    () => ({ ...snapshot, root, portalContainer, setMode }),
    [snapshot, root, portalContainer, setMode],
  );

  // The owned portal container is the root's last child; React removes it on unmount.
  const content = (
    <>
      {children}
      {explicitPortal === undefined || explicitPortal === null ? <div data-scnx-portal="" ref={setOwnedPortal} /> : null}
    </>
  );

  return (
    <ThemeContext.Provider value={value}>
      {rootElement ? (
        content
      ) : (
        <div ref={setRenderedRoot} data-scnx-theme={snapshot.themeId} data-scnx-resolved-mode={snapshot.resolvedMode}>
          {content}
        </div>
      )}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = "ThemeProvider";
