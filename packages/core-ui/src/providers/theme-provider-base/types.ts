import type { ReactNode } from "react";

/** Brand identifier; URL-safe (`[a-z0-9]+(-[a-z0-9]+)*`). */
export type ThemeId = string;

/** Requested mode. `system` is a preference, never a CSS selector value. */
export type ThemeMode = "light" | "dark" | "system";

/** Mode applied to the theme root as `data-scnx-resolved-mode`. */
export type ResolvedMode = "light" | "dark";

/** Where the current mode came from, in precedence order. */
export type ThemeSource = "controlled" | "server" | "persisted" | "system" | "default";

/** Immutable state of one theme store (TDD theme, Data Model). */
export type ThemeSnapshot = {
  themeId: ThemeId;
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  source: ThemeSource;
  /** Increments once per committed change. */
  revision: number;
};

/** Persistence of the requested mode. Values read back are untrusted. */
export type ThemePreferenceAdapter = {
  read(): string | null;
  write(mode: ThemeMode): void;
  /** Notify when another document changes the stored value. Returns an unsubscribe. */
  subscribe?(listener: () => void): () => void;
};

/** The server-rendered state the first client render must reproduce. */
export type ThemeServerHint = { mode: ThemeMode; resolvedMode: ResolvedMode };

export type ThemeStoreOptions = {
  themeId: ThemeId;
  /** Allowed theme IDs. When given, any other ID is rejected. */
  themes?: readonly ThemeId[];
  defaultMode?: ThemeMode;
  /** The state the server rendered; it outranks persisted and system values. */
  serverHint?: ThemeServerHint;
  /** `false` keeps the preference in memory only. */
  storage?: ThemePreferenceAdapter | false;
  /** The system color-scheme query; `null` when the platform has none. */
  systemQuery?: () => MediaQueryList | null;
  /** Development diagnostics; never receives stored values verbatim. */
  onDiagnostic?: (message: string) => void;
};

/**
 * Bounded theme state with subscriptions (TDD theme, ThemeStore). A store is
 * owned by one provider unless a host passes the same store to several.
 */
export type ThemeStore = {
  getSnapshot(): ThemeSnapshot;
  /** The snapshot server markup was rendered with. */
  getServerSnapshot(): ThemeSnapshot;
  subscribe(listener: () => void): () => void;
  /** Start reading persisted and system preference; returns a disconnect. */
  connect(): () => void;
  /** Commit a requested mode; invalid values are rejected and ignored. */
  setMode(mode: ThemeMode): void;
  /** The system's resolved mode, or null when unknown. */
  getSystemMode(): ResolvedMode | null;
};

export type ThemeProviderProps = {
  children?: ReactNode;
  themeId: ThemeId;
  /** Controlled mode; the store keeps reporting the system preference. */
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode, snapshot: ThemeSnapshot) => void;
  /** An explicit, possibly shared store; otherwise the provider owns one. */
  store?: ThemeStore;
  /** Preference persistence for an owned store; `false` disables it. A server hint goes through an explicit `store`. */
  storage?: ThemePreferenceAdapter | false;
  /** An existing element to use as the theme root instead of a rendered one. */
  root?: HTMLElement | null;
  /** Portal container below the theme root; otherwise the provider renders one. */
  portalContainer?: HTMLElement | null;
  /** Consumer CSP nonce, propagated to any future bootstrap; never discovered. */
  nonce?: string;
};

export type ThemeContextValue = ThemeSnapshot & {
  root: HTMLElement | null;
  portalContainer: HTMLElement | null;
  setMode(mode: ThemeMode): void;
};
