import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
// Imports from 'vitest' are handled by globals: true in config
import {
  NavigationLevelContext,
  useNavigationLevel,
} from "./NavigationLevelContext";

describe("navigationLevelContext", () => {
  it("returns default level 0 when no provider", () => {
    const { result } = renderHook(() => useNavigationLevel());
    expect(result.current).toBe(0);
  });

  it("returns provided level from context", () => {
    const { result } = renderHook(() => useNavigationLevel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationLevelContext value={2}>{children}</NavigationLevelContext>
      ),
    });

    expect(result.current).toBe(2);
  });

  it("supports nested contexts with different levels", () => {
    const { result: level1 } = renderHook(() => useNavigationLevel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationLevelContext value={1}>{children}</NavigationLevelContext>
      ),
    });

    const { result: level2 } = renderHook(() => useNavigationLevel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationLevelContext value={1}>
          <NavigationLevelContext value={2}>{children}</NavigationLevelContext>
        </NavigationLevelContext>
      ),
    });

    expect(level1.current).toBe(1);
    expect(level2.current).toBe(2);
  });

  it("handles level increments correctly", () => {
    const { result } = renderHook(() => useNavigationLevel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NavigationLevelContext value={0}>
          <NavigationLevelContext value={1}>
            <NavigationLevelContext value={2}>
              {children}
            </NavigationLevelContext>
          </NavigationLevelContext>
        </NavigationLevelContext>
      ),
    });

    expect(result.current).toBe(2);
  });
});
