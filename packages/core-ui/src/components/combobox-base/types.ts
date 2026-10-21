import type { ComponentPropsWithRef, ReactNode } from "react";

/** One option of the combobox. */
export type ComboboxBaseItem = {
  /** Identifies the option; the combobox value. */
  value: string;
  /** The text shown in the list and placed in the input when the option is accepted. */
  label: string;
  /** A disabled option is shown but skipped by arrow keys and cannot be accepted. */
  disabled?: boolean;
};

type ComboboxSelection =
  | {
      /** The accepted option's value, or null when none is (controlled). */
      value: string | null;
      /** Called with the value of the option the user accepts. */
      onValueChange: (value: string) => void;
      defaultValue?: never;
    }
  | {
      /** The initially accepted option's value (uncontrolled). */
      defaultValue?: string | null;
      onValueChange?: (value: string) => void;
      value?: never;
    };

export type ComboboxBaseProps = ComboboxSelection & {
  /** All options, in display order. */
  items: readonly ComboboxBaseItem[];
  /** Whether an option matches the typed text; defaults to a case-insensitive substring match on the label. */
  filter?: (item: ComboboxBaseItem, query: string) => boolean;
  /** Base of the input, listbox, and option ids; defaults to a generated one. */
  id?: string;
  className?: string;
  children?: ReactNode;
};

export type ComboboxBaseInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "role" | "type" | "id" | "value" | "defaultValue" | "aria-expanded" | "aria-controls" | "aria-activedescendant" | "aria-autocomplete"
>;

export type ComboboxBaseOptionState = {
  /** The option has visual focus (aria-activedescendant). */
  active: boolean;
  /** The option is the accepted value. */
  selected: boolean;
  disabled: boolean;
};

export type ComboboxBaseListboxProps = Omit<ComponentPropsWithRef<"ul">, "role" | "id" | "hidden" | "children"> & {
  /** Class name of every option element. */
  optionClassName?: string;
  /** Renders the content of one option; defaults to its label. */
  children?: (item: ComboboxBaseItem, state: ComboboxBaseOptionState) => ReactNode;
};

export type ComboboxBaseStatusProps = Omit<ComponentPropsWithRef<"div">, "role" | "children"> & {
  /** The announcement for the number of matching options while the list is open, in the consumer's language. */
  children: (count: number) => ReactNode;
};
