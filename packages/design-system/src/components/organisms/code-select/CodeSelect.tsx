"use client";

import { useState, useRef, type ReactNode } from "react";

export interface CodeSelectOption {
  id: string | number;
  title: string;
}

interface CodeSelectProps {
  options: CodeSelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  icon?: ReactNode;
  /** Accessible name of the search input. @default placeholder */
  "aria-label"?: string;
}

/**
 * CodeSelect - The premium, searchable select component for documentation.
 * THEME ENFORCED: Stealth Dark
 */
export function CodeSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  icon,
  "aria-label": ariaLabel,
}: CodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (id: any) => {
    onChange(id);
    setSearchKey("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const filteredOptions = options.filter((opt) =>
    opt.title.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <div className="scnx-code-select">
      <div 
        className="scnx-code-select__wrapper"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          className="scnx-code-select__input"
          aria-label={ariaLabel ?? placeholder}
          placeholder={selectedOption ? "" : placeholder}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              setSearchKey("");
              setIsOpen(false);
            }, 200);
          }}
        />
        {!searchKey && selectedOption && (
          <div className="scnx-code-select__display-value">
            {icon && <span className="scnx-code-select__icon">{icon}</span>}
            {selectedOption.title}
          </div>
        )}
        <span 
          className="scnx-code-select__chevron" 
          data-open={isOpen}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="scnx-code-select__dropdown">
          {filteredOptions.map((opt) => (
            <div
              key={opt.id}
              className="scnx-code-select__option"
              data-selected={opt.id === value}
              onClick={() => handleSelect(opt.id)}
            >
              {opt.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

CodeSelect.displayName = "CodeSelect";
