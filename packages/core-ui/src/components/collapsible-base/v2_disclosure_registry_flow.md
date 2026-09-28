# Disclosure Registry Flow: Atomic Shell Architecture

This document tracks the execution flow and architectural decisions behind our high-performance disclosure system.

## Phase A: The Dispatcher Logic (The Entry Point)
Component: [CollapsibleBaseRoot.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/core-ui/src/components/collapsible-base/CollapsibleBaseRoot.tsx)

By default, the `CollapsibleBaseRoot` is designed to be **Self-Sufficient**. It does not require a `registry` prop because it aims to be a standalone primitive for 90% of use cases.

### 1. Smart Participation Check
The first thing the Root does is look for a parent orchestrator:
```tsx
const hasParentContext = !!use(DisclosureContext);
```

### 2. The Twin Path Dispatcher
Based on that check, it isolatse hooks and logic into two distinct internal components to avoid "Ghost States" (redundant memory allocation):

- **Path 1: Standalone Manager** (Formerly StandaloneRoot)
  Executed when IT IS the ultimate root. It initializes its own Registry State and provides the context for its children.
  
- **Path 2: Registry Bridge** (Formerly NestedItem)
  Executed when IT IS nested inside another disclosure (like an Accordion). It skips state initialization and "Bridges" its props to the parent Registry.

---

## Phase B: Standalone Manager Logic
Component: `CollapsibleStandaloneManager` (Internal)

When acting as the root, the Manager initializes the **Disclosure Engine** for a single-item registry.

### 1. Registry Initialization
It uses `useDisclosureRegistryContextValue` to create a new state map:
```tsx
const logic = useDisclosureRegistryContextValue({
  defaultRegistry: { 
    default: { isOpen: !!defaultOpen, isClosing: false } 
  },
  // Handles controlled mode
  registry: isOpen !== undefined ? { default: { isOpen, isClosing: false } } : undefined,
  // Bridges back to the root's onOpenChange prop
  onRegistryChange: (reg) => onOpenChange?.(!!reg.default?.isOpen),
});
```

### 2. Context Provision
It provides the logic to all children using the `DisclosureContext.Provider`, with a fixed `defaultId: "default"` to simplify hook usage for its immediate children.

---

## Phase C: Registry Bridge Logic
Component: `CollapsibleRegistryBridge` (Internal)

When acting as a participant in a parent registry, the Bridge ensures that the local props still function correctly without creating its own state.

### 1. The Subscription
It does **NOT** call the registry hook. It directly calls the subscription hook:
```tsx
const { id, isOpen, setDisclosureState, regItemListener } = useDisclosureItem(value);
```

### 2. The Multi-Handshake Sync (The Expert Part)
- **The Callback Bridge**: It registers the local `onOpenChange` prop as a listener in the parent's Event Bus.
- **The Controlled Prop Bridge**: It synchronizes the `isOpen` prop (if controlled) down into the parent registry.

---

> [!TIP]
> **Conclusion**: This dual-track flow allows the component to be **Atomic & Standalone** while simultaneously being **Orchestration-Ready** without any performance leaks or logic disconnects. 🦾🚀✨🏮

---

## Phase D: The Performance Verdict (Runtime vs Bundle Size)

We consciously decided **NOT** to use `React.lazy` for the internal `Manager` vs `Bridge` dispatching.

### 1. Runtime Victory: Zero Ghost States ✅
By using **Atomic Isolation** (our Standalone vs Nested split), we ensure that even if the code for both paths exists in the bundle:
- **Only the required path is executed**.
- No redundant `useState` or `useEffect` is registered for the inactive path.
- The React reconcile process remains extremely lean.

### 2. The Suspense Penalty (Interaction vs Latency)
Atomic UI components must provide instant feedback. `React.lazy` requires a `Suspense` boundary, which adds "Popping/Flickering" and interaction lag (INP) that ruins premium enterprise experiences.

---

## Phase E: The Tree-shaking Reality Check (DX Trade-off)

To be technically transparent: As long as `CollapsibleBaseRoot` acts as a **Smart Dispatcher** that imports both `StandaloneManager` and `RegistryBridge`, the bundler **WILL NOT** tree-shake the unused branch.

### 1. The Strategy: DX-First Architecture
In FAANG-grade Design Systems (e.g. Radix, React-Aria), we prioritize **Developer Experience (Plug-and-Play)** over micro-optimizations of bundle size for core primitives. 
- **The Cost**: A few extra KB of JavaScript from the unused branch.
- **The Gain**: Developers don't have to think about "Context Tracking"—the component "just works" in any environment.

### 2. Logic Extraction (Mitigation)
We minimize the weight of both paths by extracting heavy orchestration into pure, side-effect-free modules. This ensures that the "Penalty" of including both branches is negligible (often < 1KB after Gzip).

> [!IMPORTANT]
> This architecture is a **Runtime & Memory Masterclass**. It is designed to be the fastest at execution, even if it carries a small "insurance" code-weight for better usability. 🦾🚀✨🏮
