import type { SidebarBaseToggleProps } from "./types";

/**
 * SidebarBaseToggle - a native button that expands or collapses its sidebar:
 * `aria-expanded`, `aria-controls` to the sidebar, and a required accessible
 * name (TDD primitives P11).
 */
export const SidebarBaseToggle = ({ isOpen, label, controls, children, ...rest }: SidebarBaseToggleProps) => (
  <button type="button" data-slot="toggle" aria-expanded={isOpen} aria-controls={controls} aria-label={label} {...rest}>
    {children}
  </button>
);

SidebarBaseToggle.displayName = "SidebarBaseToggle";
