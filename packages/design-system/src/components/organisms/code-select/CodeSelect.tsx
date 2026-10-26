import { useMemo, useRef, type ReactNode } from "react";
import { ComboboxBase } from "@scnx/core-ui/components/combobox-base";

export interface CodeSelectOption {
  id: string | number;
  title: string;
}

export interface CodeSelectProps {
  options: CodeSelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  icon?: ReactNode;
  /** Accessible name of the input and its list. @default placeholder */
  "aria-label"?: string;
}

/**
 * CodeSelect - a searchable select for documentation, built on ComboboxBase
 * (an editable combobox with list autocomplete; TDD primitives P18).
 *
 * Typing filters the options; Down and Up move through them, Enter accepts,
 * and Escape closes. The number of matching options is announced.
 */
export function CodeSelect({ options = [], value, onChange, placeholder = "Select...", icon, "aria-label": ariaLabel }: CodeSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const items = useMemo(() => options.map((option) => ({ value: String(option.id), label: option.title })), [options]);
  const name = ariaLabel ?? placeholder;

  return (
    <ComboboxBase
      className="scnx-code-select"
      items={items}
      value={value === undefined || value === null ? null : String(value)}
      onValueChange={(next) => onChange(options.find((option) => String(option.id) === next)?.id ?? next)}
    >
      <div
        className="scnx-code-select__wrapper"
        onClick={(event) => {
          // A press anywhere on the control opens the list, like a press on the input.
          if (event.target === inputRef.current) return;
          inputRef.current?.focus();
          inputRef.current?.click();
        }}
      >
        {icon && <span className="scnx-code-select__icon">{icon}</span>}
        <ComboboxBase.Input ref={inputRef} className="scnx-code-select__input" aria-label={name} placeholder={placeholder} />
        <span className="scnx-code-select__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <path d="M6 9.5l6 6 6-6" />
          </svg>
        </span>
      </div>
      <ComboboxBase.Listbox className="scnx-code-select__dropdown" optionClassName="scnx-code-select__option" aria-label={name}>
        {(item, { selected }) => (
          <>
            {item.label}
            {/* aria-selected already names the selection; the check is its visible cue. */}
            {selected && (
              <svg className="scnx-code-select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
          </>
        )}
      </ComboboxBase.Listbox>
      <ComboboxBase.Status className="scnx-code-select__status">{(count) => `${count} ${count === 1 ? "option" : "options"}`}</ComboboxBase.Status>
    </ComboboxBase>
  );
}

CodeSelect.displayName = "CodeSelect";
