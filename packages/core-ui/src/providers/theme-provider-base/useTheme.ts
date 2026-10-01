"use client";
import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { ThemeContextValue } from "./types";

/** The nearest ThemeProvider's state; throws a named error outside one. */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/** The nearest ThemeProvider's state, or null for components that also work without one. */
export const useOptionalTheme = (): ThemeContextValue | null => useContext(ThemeContext);
