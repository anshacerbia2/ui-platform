# Disclosure Registry Lifecycle & Orchestration

This document explains the high-performance lifecycle of the Disclosure Registry system and the intended purpose of its orchestration callbacks.

## 1. Traceable Lifecycle Phases

The registry ensures that every state transition is traceable, allowing consumers to react to different phases of a component's life.

| Phase | Event / Hook | Key State Changes | Note |
| :--- | :--- | :--- | :--- |
| **Mount** | `setRegistryItem` (Initial) | `isOpen: defaultOpen` | Syncs the initial UI intent with the Registry. |
| **Animation Start** | `setRegistryItem` (Toggle) | `isOpen` flip + `isClosing: true` | Fired immediately when user interacts. Only happens if `disabledAnimations: false`. |
| **Animation End** | `setRegistryItem` (Cleanup) | `isClosing: false` | Fired when the CSS transition completes. Signals the "Settled" state. |
| **Unmount** | `detachRegistryItem` | Key removal from Map | Clean memory by removing the item identity. |

## 2. The Role of `onRegistryChange`

`onRegistryChange` is the **Universal Pulse** of the registry. It provides a complete snapshot of the `DisclosureState` whenever any item undergoes a lifecycle phase.

### Primary Purpose: Global Orchestration (e.g., "Close All")
The "Special Purpose" of this callback is to enable complex, cross-component logic. Imagine you have 3 separate Accordion Roots in a "Code Showcase" and you want a single button in the Header to "Close All".

1. **Global Action**: Header button resets the master state in the Parent.
2. **Registry Response**: All 3 Roots receive the empty state via props.
3. **Synchronization**: Since the Registry treats the `registry` prop as the **Exclusive Source of Truth**, all items close simultaneously with full animation support.

## 3. Controlled vs. Uncontrolled Policy

The Registry follows a strict **Exclusive Truth** policy to ensure predictable performance and prevent infinite loops.

- **Uncontrolled (Internalized)**: Used for self-contained components. State lives in the Registry's internal `useState`.
- **Controlled (Externalized)**: Used for lifting state. The Registry bypasses its internal state entirely and relies 100% on the `registry` prop provided by the parent.

### Architectural Philosophy

#### 1. No Dual-Sync
We deliberately do NOT synchronize internal and external states. If we were to sync both, we would encounter bugs that are extremely difficult to trace (e.g., a Parent attempts to reset the state, but the internal Registry logic "pushes back" its own stale state, causing a collision).

#### 2. Engine vs. Storage
The Registry acts as a pure **"Orchestration Engine"** (the logic that decides which items should open or close). In Controlled mode, this Engine only calculates the outcome and passes it as a "recommendation" to the Parent via `onRegistryChange`. The Parent remains the final authority on when and how to store that state.

> [!IMPORTANT]
> Providing both `registry` and `onRegistryChange` establishes the Parent as the one and only "Boss". This eliminates "Dual-Truth" bugs and ensures that the Registry remains a pure, high-performance engine.

## 4. Performance & Intent (Enterprise Design)

- **Map-Based Bus**: We use a `Map` for listeners to ensure $O(1)$ lookup during triggers.
- **Pure Intent**: The registry only concerns itself with "Intent" (state snapshots). It does not care about the physical pixels, making it highly portable across different UI frameworks or styling systems.
- **Lifecycle Discipline**: By distinguishing between `regItemListener` (per-item events) and `onRegistryChange` (global snapshots), we allow developers to choose between "Surgical Updates" or "Global Synchronization".
