import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOptionalTheme } from "../../providers/theme-provider-base/useTheme";

/**
 * Renders a floating part into the active theme provider's portal container,
 * a descendant of the theme root, so the part keeps its theme, mode, and
 * cascade scope (TDD styled, "Portal and scope resolution"). Without a theme
 * provider it renders nothing and reports a diagnostic, as ThemeProvider does; it
 * never mounts under an unscoped `document.body`. While the provider's own
 * container is still mounting, it renders nothing.
 */
export function FloatingPortal({ name, children }: { name: string; children: ReactNode }) {
  const theme = useOptionalTheme();
  useEffect(() => {
    if (!theme) {
      console.error(`${name} needs a ThemeProvider: its floating part renders into the provider's portal container.`);
    }
  }, [theme, name]);
  const container = theme?.portalContainer;
  return container ? createPortal(children, container) : null;
}
