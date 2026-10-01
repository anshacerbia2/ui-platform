/** Root props of a disclosure scope (TDD primitives, API / Interface: AccordionRootProps). */
export type DisclosureProviderProps = {
  /** `single`: opening one item closes the others. */
  type?: "single" | "multiple";
  /** Controlled open item value(s): a string in single mode, an array in multiple mode. */
  value?: string | string[];
  /** Initially open item value(s), uncontrolled. */
  defaultValue?: string | string[];
  /** Once per accepted user intent, with the next value(s). */
  onValueChange?: (value: string | string[]) => void;
  /** Single mode: whether the open item may close. @default true */
  collapsible?: boolean;
  /** Every item is disabled. */
  disabled?: boolean;
  /** Content opens and closes without a transition. */
  disabledAnimations?: boolean;
};

/** Item props (TDD primitives, API / Interface: DisclosureItemProps). */
export type DisclosureItemOptions = {
  /** Registry key; defaults to a useId-derived instance ID. Must be unique in its root. */
  value?: string;
  /** Controlled open state of this item. */
  open?: boolean;
  /** Initial open state, uncontrolled. */
  defaultOpen?: boolean;
  /** Once per accepted change of this item's open state. */
  onOpenChange?: (open: boolean) => void;
  /** The item does not change state. */
  disabled?: boolean;
};

/** State and intents of one item, for its trigger and content parts. */
export type DisclosureItemContextValue = {
  value: string;
  open: boolean;
  disabled: boolean;
  /** Open, and closing it is not allowed (single, not collapsible). */
  locked: boolean;
  triggerId: string;
  contentId: string;
  disabledAnimations: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
};
