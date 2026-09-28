"use client";
import React, { useEffect, useState } from "react";
import type { ThemeContextValue, ThemeValue } from "./types";

type ThemeProviderProps = {
  children: React.ReactNode;
};

// We use a React Context here so child components can access the current theme
export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "light",
  isDark: false,
  setTheme: (_newTheme: ThemeValue) => {}, // no-op default
});

const scriptCode = `
  (function() {
    const transitionNoneStyles = "*, *::before, *::after { transition: none !important; }";
    window.__onThemeChange = function() {};
    function setTheme(newTheme) {
      window.__theme = newTheme;
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
      var styleTags = document.getElementsByTagName("style");
      var hasTransitionNone = false;
      for (var i = 0; i < styleTags.length; i++) {
        if (styleTags[i].innerHTML.indexOf(transitionNoneStyles) !== -1) {
          hasTransitionNone = true;
          break;
        }
      }
      if (!hasTransitionNone) {
        var style = document.createElement("style");
        style.innerHTML = transitionNoneStyles;
        document.head.appendChild(style);
        window.__onThemeChange(newTheme);
        setTimeout(() => { if (style.parentNode) style.parentNode.removeChild(style); });
      } else {
        window.__onThemeChange(newTheme);
      }
    }
    let preferredTheme;
    try { preferredTheme = localStorage.getItem("scnx-theme"); } catch (err) {}
    window.__setPreferredTheme = function(newTheme) {
      setTheme(newTheme);
      try { localStorage.setItem("scnx-theme", newTheme); } catch (err) {}
    };
    let initialTheme = preferredTheme;
    let darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (!initialTheme) {
      initialTheme = darkQuery.matches ? "dark" : "light";
    }
    setTheme(initialTheme);
    darkQuery.addEventListener("change", function(e) {
      if (!localStorage.getItem("scnx-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
  })();
`;

// Evaluate the logic immediately during module initialization in the browser (SPA context).
// This guarantees zero FOUC in Vite because the script runs before React even imports/mounts the app.
if (typeof window !== "undefined" && typeof window.__setPreferredTheme !== "function") {
  try {
    const scriptFn = new Function(
      scriptCode
        .replace(/^\s*\(\s*function\s*\(\)\s*\{/, "")
        .replace(/\}\s*\)\s*\(\)\s*;\s*$/, "")
    );
    scriptFn();
  } catch (e) {
    console.warn("Failed to initialize SPA ThemeProvider logic natively", e);
  }
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Try to get initial state from the DOM if available (client-side only), otherwise default to light
  const [theme, setThemeState] = useState<ThemeValue>("light");

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {

    // 1. Sync initial state from HTML tag once mounted (to fix hydration mismatch)
    const currentTheme = document.documentElement.getAttribute("data-theme") as ThemeValue;
    if (currentTheme) {
      setThemeState(currentTheme);
    } else if (window.__theme) {
      setThemeState(window.__theme);
    }

    // 2. Listen to changes triggered by the ThemeScript or other instances
    window.__onThemeChange = (newTheme: ThemeValue) => {
      setThemeState(newTheme);
    };
  }, []);

  // Function exposed to consumers to change the theme
  const setTheme = (newTheme: ThemeValue) => {
    // Calling the global setter from ThemeScript ensures localStorage and DOM are updated together
    if (typeof window.__setPreferredTheme === "function") {
      window.__setPreferredTheme(newTheme);
    }
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: scriptCode }} />
      {children}
    </ThemeContext.Provider>
  );
};
