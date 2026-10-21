import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import type { ComboboxBaseInputProps, ComboboxBaseItem, ComboboxBaseListboxProps, ComboboxBaseProps, ComboboxBaseStatusProps } from "./types";

type ComboboxContextValue = {
  inputId: string;
  listboxId: string;
  optionId: (value: string) => string;
  query: string;
  open: boolean;
  active: string | null;
  selected: string | null;
  visible: readonly ComboboxBaseItem[];
  setQuery: (query: string) => void;
  setOpen: (open: boolean) => void;
  setActive: (value: string | null) => void;
  move: (direction: "first" | "last" | "next" | "previous") => void;
  commit: (value: string) => void;
  dismiss: () => void;
};
const ComboboxContext = createContext<ComboboxContextValue | null>(null);

const useCombobox = (part: string): ComboboxContextValue => {
  const context = useContext(ComboboxContext);
  if (!context) throw new Error(`ComboboxBase.${part} must be rendered inside ComboboxBase`);
  return context;
};

/** An id fragment for any value: characters outside [A-Za-z0-9_-] become `_<hex>`. */
const idPart = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, (c) => `_${c.charCodeAt(0).toString(16)}`);
const contains = (item: ComboboxBaseItem, query: string) => item.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * ComboboxBase - an editable combobox with list autocomplete, after the APG
 * Combobox pattern (TDD primitives P18).
 *
 * DOM focus stays on the input; the active option is referenced by
 * `aria-activedescendant` and carries `aria-selected="true"`. Typing filters
 * the options and clears the active option, as do Left, Right, Home, and End,
 * so that screen readers keep announcing text edits. Down and Up open the list
 * and move through enabled options without wrapping; Enter accepts; Escape
 * closes and restores the accepted label. Pointer selection keeps focus in the
 * input, so no timer is needed to tell a click from a blur. The count of
 * matching options is announced through `ComboboxBase.Status`.
 *
 * @example
 * ```tsx
 * <ComboboxBase items={[{ value: "ts", label: "TypeScript" }]} defaultValue="ts">
 *   <ComboboxBase.Input aria-label="Language" />
 *   <ComboboxBase.Listbox aria-label="Languages" />
 *   <ComboboxBase.Status>{(n) => `${n} options`}</ComboboxBase.Status>
 * </ComboboxBase>
 * ```
 */
const ComboboxBaseRoot = ({ items, value, defaultValue, onValueChange, filter = contains, id: idProp, className, children }: ComboboxBaseProps): ReactElement => {
  const generated = useId();
  const baseId = idProp ?? generated;
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const selected = value !== undefined ? value : uncontrolled;
  const labelOf = useCallback((v: string | null) => items.find((item) => item.value === v)?.label ?? "", [items]);

  // `typed` is the text the user typed since the list last closed; while it is
  // null the input shows the accepted label and every option is listed.
  const [typed, setTyped] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const query = typed ?? labelOf(selected);
  const visible = useMemo(() => (typed === null ? items : items.filter((item) => filter(item, typed))), [items, typed, filter]);

  const optionId = useCallback((v: string) => `${baseId}-option-${idPart(v)}`, [baseId]);

  const move = useCallback(
    (direction: "first" | "last" | "next" | "previous") => {
      const enabled = visible.filter((item) => !item.disabled);
      if (enabled.length === 0) return setActive(null);
      const index = enabled.findIndex((item) => item.value === active);
      let next: number;
      if (direction === "first") next = 0;
      else if (direction === "last") next = enabled.length - 1;
      else if (index === -1) next = direction === "next" ? 0 : enabled.length - 1;
      // APG: on the last (first) option, Down (Up) does nothing.
      else next = direction === "next" ? Math.min(index + 1, enabled.length - 1) : Math.max(index - 1, 0);
      setActive(enabled[next].value);
    },
    [visible, active],
  );

  const commit = useCallback(
    (next: string) => {
      const item = items.find((candidate) => candidate.value === next);
      if (!item || item.disabled) return;
      if (value === undefined) setUncontrolled(next);
      if (next !== selected) onValueChange?.(next);
      setTyped(null);
      setOpen(false);
      setActive(null);
    },
    [items, value, selected, onValueChange],
  );

  const dismiss = useCallback(() => {
    setTyped(null);
    setOpen(false);
    setActive(null);
  }, []);

  const setQuery = useCallback((next: string) => {
    setTyped(next);
    setOpen(true);
    setActive(null);
  }, []);

  const context = useMemo<ComboboxContextValue>(
    () => ({
      inputId: `${baseId}-input`,
      listboxId: `${baseId}-listbox`,
      optionId,
      query,
      open,
      active,
      selected,
      visible,
      setQuery,
      setOpen,
      setActive,
      move,
      commit,
      dismiss,
    }),
    [baseId, optionId, query, open, active, selected, visible, setQuery, move, commit, dismiss],
  );
  return (
    <div className={className} data-state={open ? "open" : "closed"}>
      <ComboboxContext.Provider value={context}>{children}</ComboboxContext.Provider>
    </div>
  );
};

/** The input: role combobox, DOM focus throughout; arrow keys, Enter, and Escape drive the list. */
const ComboboxBaseInput = ({ onChange, onKeyDown, onBlur, onClick, ...props }: ComboboxBaseInputProps): ReactElement => {
  const { inputId, listboxId, optionId, query, open, active, visible, setQuery, setOpen, setActive, move, commit, dismiss } = useCombobox("Input");
  const expanded = open && visible.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (event.altKey) return setOpen(true);
        if (!open) {
          setOpen(true);
          return move("first");
        }
        return move("next");
      case "ArrowUp":
        event.preventDefault();
        if (event.altKey) return dismiss();
        if (!open) {
          setOpen(true);
          return move("last");
        }
        return move("previous");
      case "Enter":
        if (expanded && active !== null) {
          event.preventDefault();
          commit(active);
        }
        return;
      case "Escape":
        if (open) event.preventDefault();
        return dismiss();
      case "ArrowLeft":
      case "ArrowRight":
      case "Home":
      case "End":
        // The caret moves natively; with an option active, NVDA would not
        // announce the editing (TDD primitives P18).
        return setActive(null);
      case "Tab":
        return dismiss();
    }
  };

  return (
    <input
      {...props}
      type="text"
      role="combobox"
      id={inputId}
      autoComplete="off"
      aria-autocomplete="list"
      aria-expanded={expanded}
      aria-controls={listboxId}
      aria-activedescendant={expanded && active !== null ? optionId(active) : undefined}
      value={query}
      data-part="input"
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        if (!event.defaultPrevented) setQuery(event.target.value);
      }}
      onKeyDown={handleKeyDown}
      onClick={(event: MouseEvent<HTMLInputElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        dismiss();
      }}
    />
  );
};

/** The listbox of matching options; a sibling of the input, hidden while closed or empty. */
const ComboboxBaseListbox = ({ children, optionClassName, onMouseDown, ...props }: ComboboxBaseListboxProps): ReactElement => {
  const { listboxId, optionId, open, active, selected, visible, commit } = useCombobox("Listbox");

  // Keep the active option visible while arrow keys move through a scrolled list.
  useEffect(() => {
    if (active === null) return;
    document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  }, [active, optionId]);

  return (
    <ul
      {...props}
      role="listbox"
      id={listboxId}
      hidden={!open || visible.length === 0}
      data-part="listbox"
      // A press anywhere in the list, its scrollbar included, keeps DOM focus in the input.
      onMouseDown={(event) => {
        onMouseDown?.(event);
        event.preventDefault();
      }}
    >
      {visible.map((item) => {
        const state = { active: item.value === active, selected: item.value === selected, disabled: !!item.disabled };
        return (
          <li
            key={item.value}
            role="option"
            id={optionId(item.value)}
            className={optionClassName}
            aria-selected={state.active}
            aria-disabled={state.disabled || undefined}
            data-part="option"
            data-value={item.value}
            data-active={state.active || undefined}
            data-selected={state.selected || undefined}
            onClick={() => commit(item.value)}
          >
            {children ? children(item, state) : item.label}
          </li>
        );
      })}
    </ul>
  );
};

/** A polite live region that announces the number of matching options while the list is open. */
const ComboboxBaseStatus = ({ children, ...props }: ComboboxBaseStatusProps): ReactElement => {
  const { open, visible } = useCombobox("Status");
  // The region stays in the DOM, so a change of its text is announced.
  return (
    <div {...props} role="status" data-part="status">
      {open ? children(visible.length) : null}
    </div>
  );
};

ComboboxBaseRoot.displayName = "ComboboxBase";
ComboboxBaseInput.displayName = "ComboboxBase.Input";
ComboboxBaseListbox.displayName = "ComboboxBase.Listbox";
ComboboxBaseStatus.displayName = "ComboboxBase.Status";

export const ComboboxBase = Object.assign(ComboboxBaseRoot, { Input: ComboboxBaseInput, Listbox: ComboboxBaseListbox, Status: ComboboxBaseStatus });
export { ComboboxBaseInput, ComboboxBaseListbox, ComboboxBaseStatus };
