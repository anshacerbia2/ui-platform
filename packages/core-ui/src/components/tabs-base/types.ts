import type { ComponentPropsWithRef, ReactNode } from "react";

export type TabsSelection =
  | {
      /** The selected tab's value (controlled). */
      value: string;
      /** Called with the value of the tab to select. */
      onValueChange: (value: string) => void;
      defaultValue?: never;
    }
  | {
      /** The initially selected tab's value (uncontrolled). One tab is always selected. */
      defaultValue: string;
      onValueChange?: (value: string) => void;
      value?: never;
    };

export type TabsBaseProps = TabsSelection & {
  /** `automatic` (default) selects the tab that receives focus; `manual` selects on Enter, Space, or click (TDD primitives P17). */
  activation?: "automatic" | "manual";
  /** Arrow keys follow the orientation: Left/Right when horizontal, Up/Down when vertical. */
  orientation?: "horizontal" | "vertical";
  /** Base of the tab and panel ids; defaults to a generated one. */
  id?: string;
  className?: string;
  children?: ReactNode;
};

export type TabsBaseListProps = Omit<ComponentPropsWithRef<"div">, "role" | "aria-orientation">;
export type TabsBaseTabProps = Omit<ComponentPropsWithRef<"button">, "role" | "id" | "type" | "value" | "aria-selected" | "aria-controls" | "tabIndex"> & {
  /** Identifies the tab and its panel. */
  value: string;
};
export type TabsBasePanelProps = Omit<ComponentPropsWithRef<"div">, "role" | "id" | "hidden" | "aria-labelledby"> & {
  /** The value of the tab this panel belongs to. */
  value: string;
};
