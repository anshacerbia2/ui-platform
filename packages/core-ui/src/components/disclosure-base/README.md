# Disclosure Base

> A headless, enterprise-grade state management system for disclosure-related patterns (Accordions, Collapsibles, Tabs). Built for peak performance with a Map-based event bus and strict lifecycle discipline.

**Package**: `@scnx/core-ui`
**Status**: Stable
**Source**: [DisclosureContext.tsx](./DisclosureContext.tsx)

---

## Table of Contents

1. [Overview](#1-overview)
2. [When to Use](#2-when-to-use)
3. [Quick Start](#3-quick-start)
4. [Components](#4-components)
5. [Usage](#5-usage)
   5.1. [Basic Usage (Uncontrolled)](#51-basic-usage-uncontrolled)
   5.2. [Global Orchestration (Controlled)](#52-global-orchestration-controlled)
6. [API Reference](#6-api-reference)
   6.1. [DisclosureProvider](#61-disclosureprovider)
   6.2. [Context & Hooks](#62-context--hooks)
   6.2.1. [useDisclosureAPI](#621-usedisclosureapi)
   6.2.2. [useDisclosureState](#622-usedisclosurestate)
   6.2.3. [useDisclosureItem](#623-usedisclosureitem)
7. [Advanced](#7-advanced)
   7.1. [Engine vs. Storage](#71-engine-vs-storage)
   7.2. [No Dual-Sync Policy](#72-no-dual-sync-policy)
8. [Internal](#8-internal)
   8.1. [Map-Based Event Bus](#81-map-based-event-bus)
   8.2. [Race Condition Protection (Behavioral Sync)](#82-race-condition-protection-behavioral-sync)
9. [Accessibility (A11y)](#9-accessibility-a11y)
10. [Best Practices](#10-best-practices)
    10.1. [Atomic Re-render Discipline](#101-atomic-re-render-discipline)
    10.2. [Deterministic ID Usage](#102-deterministic-id-usage)
11. [Related](#11-related)
12. [Imports](#12-imports)
13. [Changelog](#13-changelog)

---

## 1. Overview

**Disclosure Base** is the core state management engine for all collapsible and orchestrated UI patterns in the system. It abstracts away the complex logic of managing multiple open/close states, animation transitions, and state orchestration.

### Key Features

- **Map-Based Storage**: Optimized `Map` for listener management, providing $O(1)$ access and zero iteration overhead for unrelated items.
- **Orchestration Logic**: Built-in support for `single` mode (auto-closing siblings) and `multiple` mode expansion.
- **Atomic Surgical Re-render**: Dual-context architecture that "cuts" the re-render chain, ensuring only the target item updates.
- **Behavioral Sync**: Automatically synchronizes late-registering listeners with current registry values to prevent missed initial states.
- **Disposer Pattern**: Standardized subscription lifecycle via returned disposer functions for leak-proof `useEffect` integrations.

---

## 2. When to Use

### ✅ Use Disclosure Base When:

- **Complex Orchestration** — Building Accordions where opening one item must close others.
- **High Performance** — Handling hundreds of items where global context updates would cause lag.
- **Logic Isolation** — You want to keep state calculation separate from UI rendering.

### ❌ Don't Use When:

- **Simple Boolean Toggle** — Use local `useState` for standalone tooltips.
- **Ready-to-use UI** — Use `Accordion` or `Collapsible` organisms instead.

---

## 3. Quick Start

```tsx
import { DisclosureProvider, DisclosureIdProvider, useDisclosureItem } from "@scnx/core-ui/disclosure-base";

function Item({ id }) {
  const { isOpen, toggle } = useDisclosureItem();
  return (
    <DisclosureIdProvider id={id}>
       <button onClick={toggle}>Toggle</button>
       {isOpen && <div>Content</div>}
    </DisclosureIdProvider>
  );
}
```

---

## 4. Components

| Component | Description |
| :--- | :--- |
| `DisclosureProvider` | Root Orchestrator. Provides State and API contexts. |
| `DisclosureIdProvider` | Scopes a specific ID to the subtree. |

---

## 5. Usage

### 5.1. Basic Usage (Uncontrolled)
The provider internally manages a `useState` for the entire registry.

### 5.2. Global Orchestration (Controlled)
Pass the `registry` and `onRegistryChange` props for absolute control from a parent/store.

---

## 6. API Reference

### 6.1. DisclosureProvider

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `"single" \| "multiple"` | `"multiple"` | Orchestration mode. |
| `registry` | `DisclosureState` | `undefined` | Controlled state override. |

### 6.2. Context & Hooks

#### 6.2.1. `useDisclosureAPI`
Returns stable methods (`setRegistryItem`, `regItemListener`). Does NOT trigger re-renders.

#### 6.2.2. `useDisclosureState`
Returns the raw `registry` object. Triggers global re-renders.

#### 6.2.3. `useDisclosureItem`
The "Expert" hook. Uses surgical subscription to re-render ONLY the specific item.

---

## 7. Advanced

### 7.1. Engine vs. Storage
The Registry acts as a pure calculation engine. In controlled mode, it only suggests snapshots to the parent.

### 7.2. No Dual-Sync Policy
Internal and external states are never synced to prevent infinite loops and "State Push-back" bugs.

---

## 8. Internal

### 8.1. Map-Based Event Bus
Uses a `Map<string, Callback[]>` for ultra-fast event broadcasting without array filtration overhead.

### 8.2. Race Condition Protection (Behavioral Sync)
`regItemListener` immediately fires with the current state upon subscription to ensure the UI matches the initial mount state.

---

## 9. Accessibility (A11y)
Automate `aria-expanded` and `aria-controls` bindings via `useDisclosureItem`.

---

## 10. Best Practices

### 10.1. Atomic Re-render Discipline
Avoid `useDisclosureState` in individual list items. Always prefer `useDisclosureItem`.

### 10.2. Deterministic ID Usage
Use stable, SSR-safe IDs (e.g., via `useId`) to ensure identity consistency across renders.

---

## 11. Related
- `TransitionBase`

## 12. Imports
```tsx
import { DisclosureProvider } from "@scnx/core-ui/disclosure-base";
```

## 13. Changelog
- **v1.5.0**: Implementation of Dual-Context (State & API) for Atomic Re-renders.

---

© 2026 SCNX UI System. All Rights Reserved.
