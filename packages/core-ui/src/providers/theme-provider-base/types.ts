export type ThemeValue = "light" | "dark";

export interface ThemeContextValue {
  theme: ThemeValue;
  isDark: boolean;
  setTheme: (newTheme: ThemeValue) => void;
}

declare global {
  interface Window {
    __theme: ThemeValue;
    __onThemeChange: (newTheme: ThemeValue) => void;
    __setPreferredTheme: (newTheme: ThemeValue) => void;
  }
}
