import tokens from "../packages/design-system/tokens.config.json";

/** Every supported theme ID, read from the token configuration. */
export const THEMES = Object.keys(tokens.themes);
export const MODES = ["light", "dark"] as const;

/** Chromatic captures each story once per theme and resolved mode. */
export const allModes = Object.fromEntries(
  THEMES.flatMap((theme) => MODES.map((mode) => [`${theme} ${mode}`, { theme, mode }])),
);
