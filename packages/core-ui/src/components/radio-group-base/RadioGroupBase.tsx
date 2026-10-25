import { createContext, useCallback, useContext, useId, useMemo, useState, type ReactElement } from "react";
import type { RadioGroupBaseItemProps, RadioGroupBaseProps } from "./types";

type RadioGroupContextValue = {
  name: string;
  checked: string | null;
  check: (value: string) => void;
  disabled: boolean;
  required: boolean;
};
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const useRadioGroup = (part: string): RadioGroupContextValue => {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error(`RadioGroupBase.${part} must be rendered inside RadioGroupBase`);
  return context;
};

/**
 * RadioGroupBase - one choice among peers, on native radios (TDD primitives
 * P28).
 *
 * Each item is a `label` around a native `input type="radio"`, and every
 * input shares one `name`, so the browser provides the behavior: Tab enters
 * the group at the checked radio (the first one when none is checked), arrow
 * keys move to the next or previous enabled radio, wrap, follow the text
 * direction, and check it, and Space checks the focused one. The root is a
 * `radiogroup` named by `aria-label` or `aria-labelledby`.
 *
 * @example
 * ```tsx
 * <RadioGroupBase aria-label="Theme" value={theme} onValueChange={setTheme}>
 *   <RadioGroupBase.Item value="light">Light</RadioGroupBase.Item>
 *   <RadioGroupBase.Item value="dark">Dark</RadioGroupBase.Item>
 * </RadioGroupBase>
 * ```
 */
const RadioGroupBaseRoot = ({ value, defaultValue, onValueChange, name: nameProp, disabled = false, required = false, children, ...props }: RadioGroupBaseProps): ReactElement => {
  const generated = useId();
  const name = nameProp ?? generated;
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const checked = value ?? uncontrolled;
  const check = useCallback(
    (next: string) => {
      if (value === undefined) setUncontrolled(next);
      if (next !== checked) onValueChange?.(next);
    },
    [value, checked, onValueChange],
  );
  const context = useMemo(() => ({ name, checked, check, disabled, required }), [name, checked, check, disabled, required]);
  return (
    <div {...props} role="radiogroup" aria-disabled={disabled || undefined} aria-required={required || undefined} data-part="root">
      <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>
    </div>
  );
};

/** One item: a label around a native radio, so a click anywhere on it checks the radio. */
const RadioGroupBaseItem = ({ value, disabled: itemDisabled = false, children, "aria-label": ariaLabel, ...props }: RadioGroupBaseItemProps): ReactElement => {
  const { name, checked, check, disabled: groupDisabled, required } = useRadioGroup("Item");
  const disabled = groupDisabled || itemDisabled;
  const isChecked = value === checked;
  return (
    <label {...props} data-part="item" data-value={value} data-state={isChecked ? "checked" : "unchecked"} data-disabled={disabled || undefined}>
      <input
        type="radio"
        data-part="input"
        aria-label={ariaLabel}
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        required={required}
        onChange={(event) => {
          if (event.currentTarget.checked) check(value);
        }}
      />
      {children}
    </label>
  );
};

RadioGroupBaseRoot.displayName = "RadioGroupBase";
RadioGroupBaseItem.displayName = "RadioGroupBase.Item";

export const RadioGroupBase = Object.assign(RadioGroupBaseRoot, { Item: RadioGroupBaseItem });
