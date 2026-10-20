import { createContext, useCallback, useContext, useId, useMemo, useState, type KeyboardEvent, type ReactElement } from "react";
import type { TabsBaseListProps, TabsBasePanelProps, TabsBaseProps, TabsBaseTabProps } from "./types";

type TabsContextValue = {
  baseId: string;
  selected: string;
  select: (value: string) => void;
  activation: "automatic" | "manual";
  orientation: "horizontal" | "vertical";
};
const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = (part: string): TabsContextValue => {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`TabsBase.${part} must be rendered inside TabsBase`);
  return context;
};

/** An id fragment for any value: characters outside [A-Za-z0-9_-] become `_<hex>`. */
const idPart = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, (c) => `_${c.charCodeAt(0).toString(16)}`);
const tabId = (baseId: string, value: string) => `${baseId}-tab-${idPart(value)}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${idPart(value)}`;

/**
 * TabsBase - tabs after the APG Tabs pattern (TDD primitives P17).
 *
 * Roving focus: only the selected tab is in the Tab sequence; arrow keys
 * (Left/Right, flipped in right-to-left text, or Up/Down when vertical) move
 * between enabled tabs and wrap,
 * Home and End jump to the ends. Activation is automatic by default; panels
 * stay rendered and hidden.
 *
 * @example
 * ```tsx
 * <TabsBase defaultValue="pay">
 *   <TabsBase.List aria-label="Employee">
 *     <TabsBase.Tab value="pay">Pay</TabsBase.Tab>
 *     <TabsBase.Tab value="leave">Leave</TabsBase.Tab>
 *   </TabsBase.List>
 *   <TabsBase.Panel value="pay">…</TabsBase.Panel>
 *   <TabsBase.Panel value="leave">…</TabsBase.Panel>
 * </TabsBase>
 * ```
 */
const TabsBaseRoot = ({ value, defaultValue, onValueChange, activation = "automatic", orientation = "horizontal", id: idProp, className, children }: TabsBaseProps): ReactElement => {
  const generated = useId();
  const baseId = idProp ?? generated;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolled;
  const select = useCallback(
    (next: string) => {
      if (value === undefined) setUncontrolled(next);
      if (next !== selected) onValueChange?.(next);
    },
    [value, selected, onValueChange],
  );
  const context = useMemo(() => ({ baseId, selected, select, activation, orientation }), [baseId, selected, select, activation, orientation]);
  return (
    <div className={className} data-orientation={orientation}>
      <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
    </div>
  );
};

// In right-to-left text, Left moves to the next tab and Right to the previous
// one; Up and Down never flip (TDD primitives P17).
const KEYS = {
  ltr: { previous: "ArrowLeft", next: "ArrowRight" },
  rtl: { previous: "ArrowRight", next: "ArrowLeft" },
  vertical: { previous: "ArrowUp", next: "ArrowDown" },
} as const;

/** The tablist; arrow keys, Home, and End move focus between its enabled tabs. */
const TabsBaseList = ({ onKeyDown, ...props }: TabsBaseListProps): ReactElement => {
  const { orientation, activation, select } = useTabs("List");
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const tabs = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current === -1) return;
    // :dir() reads the HTML directionality, set by any dir attribute above.
    const keys = orientation === "vertical" ? KEYS.vertical : event.currentTarget.matches(":dir(rtl)") ? KEYS.rtl : KEYS.ltr;
    let next: number;
    if (event.key === keys.next) next = (current + 1) % tabs.length;
    else if (event.key === keys.previous) next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    const target = tabs[next];
    target.focus();
    if (activation === "automatic") select(target.dataset.value!);
  };
  return <div {...props} role="tablist" aria-orientation={orientation === "vertical" ? "vertical" : undefined} data-part="list" onKeyDown={handleKeyDown} />;
};

/** One tab: a native button with role tab; only the selected tab is in the Tab sequence. */
const TabsBaseTab = ({ value, onClick, ...props }: TabsBaseTabProps): ReactElement => {
  const { baseId, selected, select } = useTabs("Tab");
  const isSelected = value === selected;
  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      data-value={value}
      data-part="tab"
      data-state={isSelected ? "active" : "inactive"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
    />
  );
};

/** The panel of one tab: labelled by it, focusable by default, hidden while not selected. */
const TabsBasePanel = ({ value, tabIndex = 0, ...props }: TabsBasePanelProps): ReactElement => {
  const { baseId, selected } = useTabs("Panel");
  const isSelected = value === selected;
  return (
    <div
      {...props}
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={tabIndex}
      hidden={!isSelected}
      data-part="panel"
      data-state={isSelected ? "active" : "inactive"}
    />
  );
};

TabsBaseRoot.displayName = "TabsBase";
TabsBaseList.displayName = "TabsBase.List";
TabsBaseTab.displayName = "TabsBase.Tab";
TabsBasePanel.displayName = "TabsBase.Panel";

export const TabsBase = Object.assign(TabsBaseRoot, { List: TabsBaseList, Tab: TabsBaseTab, Panel: TabsBasePanel });
export { TabsBaseList, TabsBasePanel, TabsBaseTab };
