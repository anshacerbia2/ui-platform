import { createContext, useCallback, useContext, useId, useMemo, useState, type KeyboardEvent, type ReactElement } from "react";
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
 * keys move to the next or previous enabled radio, follow the text direction,
 * and check it, and Space checks the focused one. The root is a `radiogroup`
 * named by `aria-label` or `aria-labelledby`. Only the wrap is the
 * primitive's: from the last enabled radio the next key moves to the first,
 * and back, as the APG requires, because WebKit's native radios stop at the
 * ends where Chromium and Firefox wrap.
 *
 * @example
 * ```tsx
 * <RadioGroupBase aria-label="Theme" value={theme} onValueChange={setTheme}>
 *   <RadioGroupBase.Item value="light">Light</RadioGroupBase.Item>
 *   <RadioGroupBase.Item value="dark">Dark</RadioGroupBase.Item>
 * </RadioGroupBase>
 * ```
 */
// In right-to-left text Left is the next radio and Right the previous one;
// Up and Down never flip (as native radios and TabsBase, TDD primitives P17).
const STEP: Record<string, { ltr: 1 | -1; rtl: 1 | -1 }> = {
  ArrowRight: { ltr: 1, rtl: -1 },
  ArrowLeft: { ltr: -1, rtl: 1 },
  ArrowDown: { ltr: 1, rtl: 1 },
  ArrowUp: { ltr: -1, rtl: -1 },
};

const RadioGroupBaseRoot = ({ value, defaultValue, onValueChange, name: nameProp, disabled = false, required = false, onKeyDown, children, ...props }: RadioGroupBaseProps): ReactElement => {
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
  // The wrap at either end; every other arrow key is the browser's native move.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const step = STEP[event.key];
    if (event.defaultPrevented || !step || event.altKey || event.ctrlKey || event.metaKey) return;
    const radios = [...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)')].filter((radio) => radio.name === name);
    const current = radios.indexOf(event.target as HTMLInputElement);
    if (current === -1 || radios.length < 2) return;
    const direction = event.currentTarget.matches(":dir(rtl)") ? step.rtl : step.ltr;
    const wrapsTo = direction === 1 && current === radios.length - 1 ? radios[0] : direction === -1 && current === 0 ? radios[radios.length - 1] : null;
    if (!wrapsTo) return;
    event.preventDefault();
    wrapsTo.focus();
    check(wrapsTo.value);
  };
  return (
    <div {...props} role="radiogroup" aria-disabled={disabled || undefined} aria-required={required || undefined} data-part="root" onKeyDown={handleKeyDown}>
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
