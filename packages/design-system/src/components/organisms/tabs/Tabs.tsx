import { TabsBase, TabsBaseList, TabsBasePanel, TabsBaseTab } from "@scnx/core-ui/components/tabs-base";

import type { TabsProps } from "./types";
import { cx } from "styled-system/css";

const TabsRoot = ({ className = "", ...rest }: TabsProps) => <TabsBase {...rest} className={cx("scnx-tabs", className)} />;
TabsRoot.displayName = "Tabs";

/**
 * Styled tabs after the APG Tabs pattern. Wraps
 * `@scnx/core-ui/components/tabs-base` (TDD primitives P17): roving focus,
 * arrow keys, Home and End, automatic activation by default.
 *
 * @example
 * ```tsx
 * import { Tabs } from "@scnx/system/components/tabs";
 *
 * <Tabs defaultValue="pay">
 *   <Tabs.List aria-label="Employee">
 *     <Tabs.Tab value="pay">Pay</Tabs.Tab>
 *     <Tabs.Tab value="leave">Leave</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="pay">…</Tabs.Panel>
 *   <Tabs.Panel value="leave">…</Tabs.Panel>
 * </Tabs>
 * ```
 */
export const Tabs = Object.assign(TabsRoot, { List: TabsBaseList, Tab: TabsBaseTab, Panel: TabsBasePanel });
