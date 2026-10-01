import type {
  ResolvedMode,
  ThemeMode,
  ThemePreferenceAdapter,
  ThemeSnapshot,
  ThemeStore,
  ThemeStoreOptions,
} from "./types";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];
const THEME_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && (THEME_MODES as readonly string[]).includes(value);
}

/** Validate a theme ID before it reaches the DOM; throws on an invalid one. */
export function assertThemeId(themeId: string, themes?: readonly string[]): void {
  if (!THEME_ID.test(themeId)) throw new Error(`ThemeProvider: theme ID "${themeId}" is not URL-safe`);
  if (themes && !themes.includes(themeId)) {
    throw new Error(`ThemeProvider: theme ID "${themeId}" is not one of ${themes.join(", ")}`);
  }
}

const resolve = (mode: ThemeMode, system: ResolvedMode | null): ResolvedMode =>
  mode === "system" ? (system ?? "light") : mode;

/** The browser's prefers-color-scheme query, or null outside a browser. */
export function systemColorSchemeQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia("(prefers-color-scheme: dark)");
}

/**
 * localStorage persistence of the requested mode. Every access is guarded:
 * storage may be unavailable or throw, and the provider then keeps state in
 * memory (TDD theme, Failure Handling).
 */
export function localStoragePreference(key = "scnx-theme-mode"): ThemePreferenceAdapter {
  return {
    read() {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    write(mode) {
      try {
        window.localStorage.setItem(key, mode);
      } catch {
        // Persistence is best effort.
      }
    },
    subscribe(listener) {
      if (typeof window === "undefined") return () => {};
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
  };
}

/**
 * Create a theme store. Nothing is read from storage or the system until
 * `connect`, so the first client render reproduces the server snapshot
 * (THM-002). Precedence: server hint, valid persisted mode, system, default;
 * a controlled mode is applied by the provider above all of these.
 */
export function createThemeStore(options: ThemeStoreOptions): ThemeStore {
  assertThemeId(options.themeId, options.themes);
  const defaultMode = options.defaultMode ?? "system";
  if (!isThemeMode(defaultMode)) throw new Error(`ThemeProvider: default mode "${String(defaultMode)}" is not a theme mode`);
  const hint = options.serverHint;
  if (hint && !(isThemeMode(hint.mode) && (hint.resolvedMode === "light" || hint.resolvedMode === "dark"))) {
    throw new Error("ThemeProvider: the server hint is not a valid mode pair");
  }
  const storage = options.storage === undefined ? localStoragePreference() : options.storage;
  const systemQuery = options.systemQuery ?? systemColorSchemeQuery;
  const diagnostic = options.onDiagnostic ?? (() => {});

  const serverSnapshot: ThemeSnapshot = Object.freeze({
    themeId: options.themeId,
    mode: hint?.mode ?? defaultMode,
    resolvedMode: hint?.resolvedMode ?? resolve(defaultMode, null),
    source: hint ? "server" : "default",
    revision: 0,
  });
  let snapshot = serverSnapshot;
  let system: ResolvedMode | null = null;
  const listeners = new Set<() => void>();
  let connections = 0;
  let disconnectSources: (() => void) | null = null;

  const commit = (next: Omit<ThemeSnapshot, "themeId" | "revision">) => {
    if (next.mode === snapshot.mode && next.resolvedMode === snapshot.resolvedMode && next.source === snapshot.source) return;
    snapshot = Object.freeze({ ...next, themeId: snapshot.themeId, revision: snapshot.revision + 1 });
    for (const listener of [...listeners]) listener();
  };

  const readPersisted = (): ThemeMode | null => {
    if (!storage) return null;
    const value = storage.read();
    if (value === null) return null;
    if (isThemeMode(value)) return value;
    diagnostic("ThemeProvider: ignored an invalid persisted mode");
    return null;
  };

  /** Initial state once connected: the sources below a controlled mode, in precedence order. */
  const reconcile = () => {
    if (hint) {
      commit({ mode: hint.mode, resolvedMode: resolve(hint.mode, system), source: hint.mode === "system" && system ? "system" : "server" });
      return;
    }
    const persisted = readPersisted();
    if (persisted) {
      commit({ mode: persisted, resolvedMode: resolve(persisted, system), source: "persisted" });
    } else if (defaultMode === "system" && system) {
      commit({ mode: "system", resolvedMode: system, source: "system" });
    } else {
      commit({ mode: defaultMode, resolvedMode: resolve(defaultMode, system), source: "default" });
    }
  };

  const connectSources = () => {
    const cleanups: Array<() => void> = [];
    const query = systemQuery();
    if (query) {
      system = query.matches ? "dark" : "light";
      const onChange = (event: MediaQueryListEvent) => {
        system = event.matches ? "dark" : "light";
        if (snapshot.mode === "system") {
          commit({ mode: "system", resolvedMode: system, source: snapshot.source === "server" ? "system" : snapshot.source });
        } else {
          // A controlled "system" mode above the store follows getSystemMode().
          for (const listener of [...listeners]) listener();
        }
      };
      query.addEventListener("change", onChange);
      cleanups.push(() => query.removeEventListener("change", onChange));
    } else {
      diagnostic("ThemeProvider: no system color-scheme query; using the declared default");
    }
    // Another document stored a new preference: that is the latest user intent.
    const onStoredChange = () => {
      const persisted = readPersisted();
      if (persisted) commit({ mode: persisted, resolvedMode: resolve(persisted, system), source: "persisted" });
    };
    if (storage && storage.subscribe) cleanups.push(storage.subscribe(onStoredChange));
    reconcile();
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    getSystemMode: () => system,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    connect() {
      connections++;
      if (connections === 1) disconnectSources = connectSources();
      let connected = true;
      return () => {
        if (!connected) return;
        connected = false;
        connections--;
        if (connections === 0 && disconnectSources) {
          disconnectSources();
          disconnectSources = null;
        }
      };
    },
    setMode(mode) {
      if (!isThemeMode(mode)) {
        diagnostic("ThemeProvider: rejected an invalid mode");
        return;
      }
      commit({ mode, resolvedMode: resolve(mode, system), source: "persisted" });
      if (storage) storage.write(mode);
    },
  };
}
