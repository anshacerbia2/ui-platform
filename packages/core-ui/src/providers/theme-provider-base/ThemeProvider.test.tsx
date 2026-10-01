import { act, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { createPortal } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { createThemeStore, localStoragePreference } from "./store";
import type { ThemePreferenceAdapter } from "./types";
import { useTheme } from "./useTheme";

/** A controllable prefers-color-scheme query that counts its listeners. */
function fakeQuery(matches = false) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
  };
  return {
    query: query as unknown as MediaQueryList,
    listeners,
    change(next: boolean) {
      query.matches = next;
      for (const listener of [...listeners]) listener({ matches: next } as MediaQueryListEvent);
    },
  };
}

function memoryStorage(initial: string | null = null): ThemePreferenceAdapter & { value: string | null } {
  const adapter = {
    value: initial,
    read: () => adapter.value,
    write: (mode: string) => {
      adapter.value = mode;
    },
  };
  return adapter;
}

const Probe = ({ label = "probe" }: { label?: string }) => {
  const theme = useTheme();
  return (
    <button type="button" data-testid={label} data-mode={theme.mode} data-resolved={theme.resolvedMode} data-source={theme.source} onClick={() => theme.setMode("dark")}>
      {theme.themeId}
    </button>
  );
};

const rootOf = (label = "probe") => screen.getByTestId(label).closest("[data-scnx-theme]")!;

let system: ReturnType<typeof fakeQuery>;
beforeEach(() => {
  system = fakeQuery(false);
  vi.spyOn(window, "matchMedia").mockImplementation(() => system.query);
  window.localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("createThemeStore", () => {
  it("applies precedence: server hint, persisted, system, default", () => {
    const hinted = createThemeStore({ themeId: "default", serverHint: { mode: "light", resolvedMode: "light" }, storage: memoryStorage("dark"), systemQuery: () => system.query });
    hinted.connect();
    expect(hinted.getSnapshot()).toMatchObject({ mode: "light", source: "server" });

    const persisted = createThemeStore({ themeId: "default", storage: memoryStorage("dark"), systemQuery: () => system.query });
    persisted.connect();
    expect(persisted.getSnapshot()).toMatchObject({ mode: "dark", resolvedMode: "dark", source: "persisted" });

    system.change(true);
    const fromSystem = createThemeStore({ themeId: "default", storage: memoryStorage(), systemQuery: () => system.query });
    fromSystem.connect();
    expect(fromSystem.getSnapshot()).toMatchObject({ mode: "system", resolvedMode: "dark", source: "system" });

    const fallback = createThemeStore({ themeId: "default", defaultMode: "light", storage: false, systemQuery: () => null });
    fallback.connect();
    expect(fallback.getSnapshot()).toMatchObject({ mode: "light", resolvedMode: "light", source: "default" });
  });

  it("ignores an invalid persisted value with a diagnostic", () => {
    const onDiagnostic = vi.fn();
    const store = createThemeStore({ themeId: "default", defaultMode: "light", storage: memoryStorage("<script>"), systemQuery: () => null, onDiagnostic });
    store.connect();
    expect(store.getSnapshot()).toMatchObject({ mode: "light", source: "default" });
    expect(onDiagnostic).toHaveBeenCalledWith("ThemeProvider: ignored an invalid persisted mode");
  });

  it("keeps state in memory when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const store = createThemeStore({ themeId: "default", defaultMode: "light", storage: localStoragePreference(), systemQuery: () => null });
    store.connect();
    store.setMode("dark");
    expect(store.getSnapshot()).toMatchObject({ mode: "dark", resolvedMode: "dark" });
  });

  it("rejects invalid theme IDs and modes before any state changes", () => {
    expect(() => createThemeStore({ themeId: "Default Brand" })).toThrow("not URL-safe");
    expect(() => createThemeStore({ themeId: "other", themes: ["default"] })).toThrow("not one of default");
    const store = createThemeStore({ themeId: "default", storage: false, systemQuery: () => null });
    const before = store.getSnapshot();
    store.setMode("sepia" as never);
    expect(store.getSnapshot()).toBe(before);
  });

  it("commits one revision per change and follows the system while in system mode", () => {
    const store = createThemeStore({ themeId: "default", storage: false, systemQuery: () => system.query });
    store.connect();
    const listener = vi.fn();
    store.subscribe(listener);
    const revision = store.getSnapshot().revision;
    system.change(true);
    expect(store.getSnapshot()).toMatchObject({ resolvedMode: "dark", revision: revision + 1 });
    store.setMode("light");
    expect(store.getSnapshot()).toMatchObject({ mode: "light", revision: revision + 2 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("removes its media and storage listeners when the last connection ends", () => {
    const unsubscribe = vi.fn();
    const storage = { ...memoryStorage(), subscribe: vi.fn(() => unsubscribe) };
    const store = createThemeStore({ themeId: "default", storage, systemQuery: () => system.query });
    const first = store.connect();
    const second = store.connect();
    expect(system.listeners.size).toBe(1);
    first();
    expect(system.listeners.size).toBe(1);
    second();
    second();
    expect(system.listeners.size).toBe(0);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe("ThemeProvider", () => {
  it("renders a root with exactly the theme identity attributes", () => {
    render(
      <ThemeProvider themeId="default" defaultMode="dark" storage={false}>
        <Probe />
      </ThemeProvider>,
    );
    const root = rootOf();
    expect(root.getAttribute("data-scnx-theme")).toBe("default");
    expect(root.getAttribute("data-scnx-resolved-mode")).toBe("dark");
    expect([...root.attributes].map((a) => a.name).sort()).toEqual(["data-scnx-resolved-mode", "data-scnx-theme"]);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect("__theme" in window || "__setPreferredTheme" in window || "__onThemeChange" in window).toBe(false);
  });

  it("isolates two providers; a shared store is shared on purpose", () => {
    const shared = createThemeStore({ themeId: "default", defaultMode: "light", storage: false });
    render(
      <>
        <ThemeProvider themeId="default" defaultMode="light" storage={false}><Probe label="a" /></ThemeProvider>
        <ThemeProvider themeId="achromatic" defaultMode="light" storage={false}><Probe label="b" /></ThemeProvider>
        <ThemeProvider themeId="default" store={shared}><Probe label="c" /></ThemeProvider>
        <ThemeProvider themeId="achromatic" store={shared}><Probe label="d" /></ThemeProvider>
      </>,
    );
    act(() => screen.getByTestId("a").click());
    expect(rootOf("a").getAttribute("data-scnx-resolved-mode")).toBe("dark");
    expect(rootOf("b").getAttribute("data-scnx-resolved-mode")).toBe("light");
    expect(rootOf("b").getAttribute("data-scnx-theme")).toBe("achromatic");

    act(() => screen.getByTestId("c").click());
    expect(rootOf("c").getAttribute("data-scnx-resolved-mode")).toBe("dark");
    expect(rootOf("d").getAttribute("data-scnx-resolved-mode")).toBe("dark");
    expect(rootOf("d").getAttribute("data-scnx-theme")).toBe("achromatic");
  });

  it("reports a controlled mode change without changing state itself", () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <ThemeProvider themeId="default" mode="light" onModeChange={onModeChange} storage={false}><Probe /></ThemeProvider>,
    );
    act(() => screen.getByTestId("probe").click());
    expect(onModeChange).toHaveBeenCalledWith("dark", expect.objectContaining({ mode: "dark", resolvedMode: "dark" }));
    expect(rootOf().getAttribute("data-scnx-resolved-mode")).toBe("light");
    rerender(<ThemeProvider themeId="default" mode="dark" onModeChange={onModeChange} storage={false}><Probe /></ThemeProvider>);
    expect(screen.getByTestId("probe")).toHaveAttribute("data-source", "controlled");
    expect(rootOf().getAttribute("data-scnx-resolved-mode")).toBe("dark");
  });

  it("follows the system preference in a controlled system mode", () => {
    render(<ThemeProvider themeId="default" mode="system" storage={false}><Probe /></ThemeProvider>);
    expect(rootOf().getAttribute("data-scnx-resolved-mode")).toBe("light");
    act(() => system.change(true));
    expect(rootOf().getAttribute("data-scnx-resolved-mode")).toBe("dark");
  });

  it("keeps the last valid theme when an update names an unknown one", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(<ThemeProvider themeId="default" storage={false}><Probe /></ThemeProvider>);
    rerender(<ThemeProvider themeId={"bad id" as string} storage={false}><Probe /></ThemeProvider>);
    expect(rootOf().getAttribute("data-scnx-theme")).toBe("default");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("not URL-safe"));
  });

  it("mounts portaled content under the originating theme root", () => {
    const Portaled = () => {
      const { portalContainer } = useTheme();
      return portalContainer ? createPortal(<span data-testid="portaled">overlay</span>, portalContainer) : null;
    };
    render(
      <>
        <ThemeProvider themeId="default" storage={false}><Probe label="a" /><Portaled /></ThemeProvider>
        <ThemeProvider themeId="achromatic" storage={false}><Probe label="b" /></ThemeProvider>
      </>,
    );
    expect(screen.getByTestId("portaled").closest("[data-scnx-theme]")).toBe(rootOf("a"));
  });

  it("applies attributes to an existing root and restores them on unmount", () => {
    const host = document.createElement("section");
    host.setAttribute("data-scnx-theme", "host");
    document.body.append(host);
    const { unmount } = render(<ThemeProvider themeId="default" defaultMode="dark" storage={false} root={host}><Probe /></ThemeProvider>);
    expect(host.getAttribute("data-scnx-theme")).toBe("default");
    expect(host.getAttribute("data-scnx-resolved-mode")).toBe("dark");
    unmount();
    expect(host.getAttribute("data-scnx-theme")).toBe("host");
    expect(host.hasAttribute("data-scnx-resolved-mode")).toBe(false);
    host.remove();
  });

  it("leaves no listener and no owned node after Strict Mode mount and unmount", () => {
    const { unmount, container } = render(
      <StrictMode><ThemeProvider themeId="default" storage={localStoragePreference()}><Probe /></ThemeProvider></StrictMode>,
    );
    expect(system.listeners.size).toBe(1);
    unmount();
    expect(system.listeners.size).toBe(0);
    expect(system.query.addEventListener).toHaveBeenCalledTimes((system.query.removeEventListener as ReturnType<typeof vi.fn>).mock.calls.length);
    expect(container.innerHTML).toBe("");
  });

  it("throws a named error outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useTheme must be used within a ThemeProvider");
  });
});

describe("SSR and hydration", () => {
  it("hydrates the server snapshot without a mismatch, then applies the stored preference", async () => {
    const app = (
      <ThemeProvider themeId="default" defaultMode="light">
        <Probe />
      </ThemeProvider>
    );
    // Server render: no storage or media access influences markup.
    const html = renderToString(app);
    expect(html).toContain('data-scnx-resolved-mode="light"');

    window.localStorage.setItem("scnx-theme-mode", "dark");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const recoverable = vi.fn();
    const error = vi.spyOn(console, "error");
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, app, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(error.mock.calls.flat().join(" ")).not.toMatch(/hydrat|did not match/i);
    expect(container.querySelector("[data-scnx-theme]")!.getAttribute("data-scnx-resolved-mode")).toBe("dark");
    await act(async () => root.unmount());
    container.remove();
  });

  it("renders a server hint and keeps it through hydration", async () => {
    window.localStorage.setItem("scnx-theme-mode", "light");
    const store = createThemeStore({ themeId: "default", serverHint: { mode: "dark", resolvedMode: "dark" } });
    const app = (
      <ThemeProvider themeId="default" store={store}>
        <Probe />
      </ThemeProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(app);
    document.body.append(container);
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, app, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.querySelector("[data-scnx-theme]")!.getAttribute("data-scnx-resolved-mode")).toBe("dark");
    await act(async () => root.unmount());
    container.remove();
  });

  it("has no effect when the module is evaluated", async () => {
    vi.resetModules();
    const matchMedia = vi.spyOn(window, "matchMedia");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const before = document.documentElement.outerHTML;
    await import("./index");
    expect(matchMedia).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    expect(document.documentElement.outerHTML).toBe(before);
  });
});
