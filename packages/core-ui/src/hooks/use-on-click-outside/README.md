# useOnClickOutside

> Detects clicks outside of a specified element (or elements) with optimized event listener management.

**Package**: `@scnx/core-ui`
**Status**: Stable
**Source**: [index.ts](./index.ts)

---

## Table of Contents

1. [Overview](#1-overview)
2. [When to Use](#2-when-to-use)
3. [Quick Start](#3-quick-start)
4. [Internal](#4-internal)
   4.1. [Mental Model: Smart Exclusion](#41-mental-model-smart-exclusion)
   4.2. [Optimization Strategy](#42-optimization-strategy-conditional-attach)
5. [Usage](#5-usage)
   5.1. [Basic Usage](#51-basic-usage)
   5.2. [Multiple Refs (Exclusion)](#52-multiple-refs-exclusion)
   5.3. [Conditional Disable](#53-conditional-disable)
6. [API Reference](#6-api-reference)
7. [Best Practices](#7-best-practices)
   7.1. [Memoize Ref Arrays](#71-memoize-ref-arrays-prevent-thrashing)
   7.2. [Memoize Your Handlers](#72-memoize-your-handlers-important)

---

## 1. Overview

A high-performance hook designed to handle "click outside" interactions for UI elements like Modals, Dropdowns, Flyouts, and Drawers.

Unlike standard implementations, this hook is **performance-aware**. It dynamically attaches/detaches global event listeners based on the presence of the **exclusion refs** or **handler**, ensuring zero overhead when the feature is disabled (e.g., when a modal is closed).

### Key Features

- **Robust Detection:** Works with mouse (`mousedown`, `mouseup`, `click`) and touch events (`touchstart`).
- **Multiple Refs Strategy:** Can monitor an **array of refs**. This is critical for excluding multiple elements (e.g., "The Flyout" AND "The Trigger Button") from triggering the close action.
- **Optimization Engine:** **Smart Detach** — If `ref` or `handler` is `null` or `undefined`, listeners are completely removed.

---

## 2. When to Use

### ✅ Use When:

- **Closing Overlays** - You need to close a Modal, Sidebar Flyout, or Dropdown when the user clicks elsewhere.
- **Complex Exclusion** - You have a "Trigger" button that is physically separate from the "Content" (not parent-child), and clicking the Trigger shouldn't close the Content immediately.
- **Performance Critical** - You want to ensure global listeners are cleaned up immediately when the component is hidden.

### ❌ Don't Use When:

- **Simple onBlur** - For simple inputs, `onBlur` might be sufficient and more native.
- **iframe Detection** - This hook listens to `document` events. It cannot easily detect clicks inside an iframe (different window context).

---

## 3. Quick Start

**Basic Implementation:**

```tsx
import { useCallback, useRef, useState } from "react";
import { useOnClickOutside } from "@scnx/core-ui/hooks/use-on-click-outside";

const MyComponent = () => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Best Practice: Memoize handler to prevent listener thrashing
  const close = useCallback(() => setIsOpen(false), []);

  // Hook active only when isOpen is true (handler passed)
  useOnClickOutside(ref, isOpen ? close : null);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div ref={ref}>I'm open! Click outside to close.</div>}
    </div>
  );
};
```

---

## 4. Internal

### 4.1. Mental Model: Smart Exclusion

> **How it differentiates "Inside" vs "Outside":**
> Instead of stopping event propagation (which can break third-party analytics), this hook uses a **Geometry Check**:
> "Is the clicked target contained within ANY of the provided refs?"
>
> - **Yes?** Ignore. (It's an 'inside' click).
> - **No?** Trigger Handler. (It's an 'outside' click).

This allows you to pass both the **Popup** and the **Trigger Button** as refs. Clicking the trigger won't define as "outside", preventing the "Open -> Immediately Close" flicker.

### 4.2. Optimization Strategy: Conditional Attach

We intentionally designed this hook to use the `ref` and `handler` props as dependencies, prioritizing resource cleanup over listener stability.

#### 4.2.1 Implementation Comparison

| Strategy               | Traditional (`useRef` proxy)      | Our Approach (Dependency)                 |
| :--------------------- | :-------------------------------- | :---------------------------------------- |
| **Listener Status**    | Always attached (even if unused). | **Detached when handler OR ref is null.** |
| **Memory Cost**        | High (Permanent listeners).       | **Zero (when disabled).**                 |
| **CPU Cost (Updates)** | Low (Variable assignment).        | Medium (DOM Operation).                   |
| **Stability**          | Stable (No re-attach).            | dynamic (Re-attaches on change).          |

> **💡 Design Rationale:**
> We chose the **Optimized Approach** because "Zombie Listeners" (listeners that stay alive but unused) are a common source of memory leaks and unexpected behavior in large apps.
> We prioritize **Correctness (Memory)** over minor CPU overhead. The CPU cost of re-attaching listeners is negligible in most cases, and can be completely eliminated by using `useCallback` (see Best Practices).

**A. Traditional Case (The "Zero-Dep" Pattern):**

```tsx
// 1. Create Refs proxy
const currentRef = useRef(ref);
const handlerRef = useRef(handler);

// 2. Sync Refs (Keep them fresh)
useEffect(() => {
  currentRef.current = ref;
  handlerRef.current = handler;
}, [ref, handler]);

// 3. Attach Listener (Truly Once)
useEffect(() => {
  const listener = (event) => {
    // Unpack the proxy
    const rawRef = currentRef.current;
    const el = event.target as Node;
    const refs = Array.isArray(rawRef) ? rawRef : [rawRef];

    // Exact same check logic as Optimized Case
    const isInside = refs.some((r) => {
      if (!r) return false;
      if ("current" in r && r.current) {
        return r.current.contains(el);
      }
      if (r instanceof HTMLElement) {
        return r.contains(el);
      }
      return false;
    });

    if (isInside) return;

    handlerRef.current(event);
  };

  document.addEventListener("click", listener);
  return () => document.removeEventListener("click", listener);
}, []); // ✅ STRICTLY EMPTY DEPS (Never re-attaches)
```

> **⛔ Limitation:** Because dependencies are empty `[]`, this effect runs **ONLY on mount**. We CANNOT conditionally add/remove listeners based on props here. They stay active for the entire component lifespan.

**B. Optimized Case (Current):**

```tsx
// ✅ Listeners detached if dependencies are missing
useEffect(() => {
  // EARLY RETURN: Zero Overhead
  if (!ref || !handler) return;

  const listener = (event: AnyEvent) => {
    const el = event.target as Node;
    const refs = Array.isArray(ref) ? ref : [ref];
    const isInside = refs.some((r) => {
      if (!r) return false;
      if ("current" in r && r.current) {
        return r.current.contains(el);
      }
      if (r instanceof HTMLElement) {
        return r.contains(el);
      }
      return false;
    });

    if (isInside) return;
    handler(event);
  };

  document.addEventListener(mouseEvent, listener);
  return () => document.removeEventListener(mouseEvent, listener);
}, [ref, handler]); // Re-runs (updates listeners) when inputs change
```

> **Implication:**
> Because we re-attach listeners when the handler changes (to support the "detach" feature), passing an unstable inline function will cause "Listener Thrashing" (Remove/Add every render).
>
> **Solution:** Use `useCallback` (see Best Practices). This gives you the best of both worlds: **Zero Cost** when disabled, and **Stable Listeners** when enabled.

---

## 5. Usage

### 5.1. Basic Usage

Monitors a single ref. Useful for simple standalone dropdowns.
Ensures handler is memoized or stable.

```tsx
const ref = useRef(null);
// Stable handler
const closeInfo = useCallback(() => setIsOpen(false), []); 

useOnClickOutside(ref, closeInfo);
```

### 5.2. Multiple Refs (Exclusion)

```tsx
const flyoutRef = useRef(null);
const triggerRef = useRef(null);

// Stable refs array and handler
const refs = useMemo(() => [flyoutRef, triggerRef], [flyoutRef, triggerRef]);
const close = useCallback(() => setIsOpen(false), []);

useOnClickOutside(refs, close);
```

### 5.3. Conditional Disable

Pass `null` as the **handler** OR the **ref** to fully detach listeners.

```tsx
// Option A: Null Handler
useOnClickOutside(ref, isLoading ? null : handleClick);

// Option B: Null Ref
useOnClickOutside(isOpen ? ref : null, handleClick);
```

---

## 6. API Reference

```typescript
const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | T | (RefObject<T> | T | null)[] | null,
  handler: ((event: AnyEvent) => void) | null | undefined,
  mouseEvent: "click" | "mousedown" | "mouseup" = "click"
): void => { ... };
```

| Param        | Type                                     | Description                                                                                           |
| :----------- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `ref`        | `RefObject \| Element \| Array`          | The allow-list elements. Clicks **inside** these are ignored. Clicks **outside** trigger the handler. |
| `handler`    | `((event) => void) \| null \| undefined` | The callback function. **Pass `null` to disable detection** (removes event listeners).                |
| `mouseEvent` | `'click' \| 'mousedown' \| 'mouseup'`   | The specific DOM event to listen for. Defaults to `'click'`.                                          |

---

## 7. Best Practices

### 7.1. Memoize Ref Arrays (Prevent Thrashing)

If you pass an **array of refs** (e.g., for exclusion), **DO NOT** create the array inline, as it creates a new reference on every render.

**Bad (Listener Thrashing):**

```tsx
// ❌ New array [] created every render -> Effect re-runs -> Listeners detach/reattach
useOnClickOutside([ref1, ref2], close);
```

**Good (Stable):**

```tsx
// ✅ Stable refs reference
const refs = useMemo(() => [ref1, ref2], [ref1, ref2]);
useOnClickOutside(refs, close);
```

### 7.2. Memoize Handlers (Prevent Thrashing)

If you pass an **inline function** as the handler, **DO NOT** create the function inline, as it creates a new reference on every render.

**Bad (Listener Thrashing):**

```tsx
// ❌ New handler created every render -> Effect re-runs -> Listeners detach/reattach
useOnClickOutside(ref, () => setIsOpen(false));
```

**Good (Stable):**

```tsx
// ✅ Stable handler reference
const close = useCallback(() => setIsOpen(false), []);
useOnClickOutside(ref, close);
```
