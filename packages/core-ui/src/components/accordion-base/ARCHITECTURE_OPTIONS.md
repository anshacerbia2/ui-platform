# Accordion Architecture: The Expert Comparison

This document explores three distinct architectural patterns for building a headless Accordion by composing Collapsible primitives. Each option is evaluated based on its **Expert Level**, **Performance**, and **Context Nesting**.

---

## Option 1: The Context Bridge (Standard/Radix-Style)
This is the most "Bulletproof" approach. Each Accordion Item acts as a bridge that creates a new, isolated `CollapsibleContext` for its children.

### Conceptual Implementation
```tsx
const AccordionItem = ({ value, children }) => {
  const { activeId, setOpen } = useAccordion();
  
  // Bridge: Translate Accordion state to Collapsible state
  const logic = useCollapsibleLogic({
     isOpen: activeId === value,
     onOpenChange: (open) => setOpen(value, open)
  });

  return (
    <CollapsibleContext value={logic}>
       {children} 
    </CollapsibleContext>
  );
}
```

- **Expert Level**: 07/10 (Industry Standard)
- **Context Nesting**: **HEAVY**. 1 Provider per item.
- **Performance**: Good (Isolated re-renders).
- **Isolation**: **MAXIMUM**. `Trigger` and `Content` remain pure and headless.

---

## Option 2: The Smart Atomic (Hybrid Aware)
Sub-components (`Trigger`, `Content`) are designed to be "Context-Aware" of both their direct parent and any potential orchestrator like an `Accordion`.

### Conceptual Implementation
```tsx
const Trigger = () => {
  const collapsible = useCollapsible(); // Explicit local context
  const accordion = useAccordion();     // Optional orchestrator context

  // Pivot: If no local context, try to read from the Accordion Registry
  const logic = collapsible || accordion.getItem(thisId);

  return <button onClick={logic.toggle}>{children}</button>;
}
```

- **Expert Level**: 08/10 (Framework Optimization)
- **Context Nesting**: **LIGHT**. No providers inside items.
- **Performance**: High (Flatter React tree).
- **Isolation**: **LOW**. Primitives become aware of the orchestrator layer.

---

## Option 3: The Registry Pattern (FAANG-Grade)
The absolute pinnacle of "Expert" architecture. A single, top-level Provider manages a **State Registry** of all sub-components. Components subscribe to their specific slice of the registry via a central ID.

### Conceptual Implementation
```tsx
// Inside Accordion.Root (Single Provider)
const registry = {
  "item-1": { state: 'open', type: 'collapsible' },
  "item-2": { state: 'closed', type: 'collapsible' },
};

// Inside Trigger
const Trigger = ({ value }) => {
  // Direct subscription to the registry slice
  const { state, toggle } = useRegistry(value); 
  return <button onClick={toggle}>{children}</button>;
}
```

- **Expert Level**: **10/10 (State-of-the-Art)**
- **Context Nesting**: **NONE**. Flat hierarchy across all items.
- **Performance**: **MAXIMUM**. Targeted re-renders via Pub/Sub or granular selectors.
- **Complexity**: **HIGH**. Requires a robust registration/reconciliation system.

---

## The "Animation Signal First" Mental Model
This is the definitive handshake between the **Disclosure Registry** (Logic) and the **Transition Engine** (Style).

- **`isOpen` (Presence Guard)**:
  Handles the "Render Lifecycle". As long as this is `true`, the component exists in the React tree and internal conditional content is preserved.
- **`isClosing` (Animation Signal)**:
  Handles the "Visual Orchestration". When this becomes `true`, it signals the transition engine to start its exit phase.

### The Handshake Flow:
1. **Intent to Close**: User clicks $\to$ `isClosing: true` (Trigger starts). `isOpen` stays `true` (Visuals stay).
2. **Animation**: Transition engine runs.
3. **Completion**: Transition engine finishes $\to$ `isOpen: false` & `isClosing: false` (Presence is removed).

---

## Feature List: The Atomic Shell Powerhouse
- **One Provider to Rule Them All**: Single `DisclosureContext` orchestrates `N` number of items.
- **Presence Guard Pattern**: Decoupled `isOpen` (Render) and `isClosing` (Animation) logic.
- **Mode Switching**: Native support for `single` (exclusive) and `multiple` (independent) selection.
- **Zero-Lag Mirroring**: Synchronous ref-mirroring for referential stability of functions.
- **Express Unmount**: `disabledAnimations` bypass for instant UI response.
- **Stable ARIA Identities**: Automatic and synchronized `triggerId` / `contentId` generation.

## Keunggulan (Advantages)
- **Ultra-Flat Component Tree**: Benar-benar mematikan "Provider Fatigue". DevTools lo bakal tetap bersih meskipun ada ratusan item.
- **High-Fidelity Interaction**: Komponen internal (Children) tidak akan "ompong" atau hilang mendadak saat animasi tutup, berkat pemisahan `isOpen` dan `isClosing`.
- **Maximum Performance**: `onItemChange` memiliki referensi yang *batu* (stable), mencegah re-render sampah di seluruh pohon komponen.
- **Unified Logic**: Satu mesin `disclosure-base` yang sama untuk `Collapsible`, `Accordion`, dan `Tabs` ke depannya.

---

## Advanced Registry Orchestration: The Triple-Path Evaluation

After several iterations, we evaluated three philosophies to solve the **"Provider Fatigue vs Tree Purity"** problem.

### Option A: Global Provider (Manual Wrapping)
Similar to `SidebarProvider`, the `DisclosureProvider` is managed manually by the developer outside the atomic components.
- **Pros**: Perfectly clean tree, 100% decoupled logic, zero "Ghost States" inside primitives.
- **Cons**: High developer friction (not Plug-and-Play), violates encapsulation, requires manual wiring for simple usage.

### Option B: Recursive Aliasing (Logic Cloning)
Every component root aliases to a single base (e.g., `AccordionRoot = CollapsibleRoot`).
- **Pros**: Consistent API, highly "DRY" (Don't Repeat Yourself).
- **Cons**: Rigid, creates "Prop Bloat" (passing irrelevant logic props through layers), hard to manage specialized group behaviors (single vs multiple selection).

### Option C: Smart Singleton Root (The FAANG Expert Choice) ✅
The Root component is "Registry-Aware". It detects if a parent context exists and conditionally acts as either a **Provider** or a **Nested Bridge**.
- **Pros**: Perfect User Experience (Plug-and-Play), Ultra-Flat Tree (Zero redundant providers), Fully synchronized props (`onOpenChange` always works).
- **Cons**: Internal implementation complexity (Atomic Split required for Hook Safety).

---

## Technical Analysis: Why Option C is High-Performance?

The biggest concern with "Smart Roots" is the overhead of conditional logic and potential "Ghost States" (redundant React logic running in the background).

### The "Atomic Isolation" Technique
To achieve FAANG-grade performance, we implement **Atomic Isolation**:

1. **Isolation of Hooks**: We never use conditional hooks (illegal). Instead, we split the logic into two internal components: `StandaloneRoot` and `NestedItem`.
2. **Zero Ghost States**: When `NestedItem` is rendered, the local registry hooks (useState, useCallback) inside `StandaloneRoot` are **never executed**. React doesn't even allocate memory for them.
3. **Static Reconciliation Path**: Since component nesting is usually static in the tree, React resolves the render path once. There is no runtime "guessing" overhead.

---

## The Registry Event Bus: `regItemListener`

To bridge the gap between a **Standalone Root** and a **Nested Item Shell**, we implemented a high-performance event bus inside the Disclosure Registry. This is what allows a nested `Collapsible.Root` to execute its `onOpenChange` prop even when it's no longer the master of its own state.

### Technical Pillars:
1. **Referential Stability**:
   Wrapped in `useCallback` and interacting with a stable `listenersRef`, the function identity never changes. This prevents downstream components from re-rendering unless absolutely necessary.
2. **Memory Efficiency**:
   We use `useRef` for the listener map (an optimized `Map` engine). This keeps the React state footprint minimal and avoids the "Ghost State" overhead during complex reconciliation cycles.
3. **Disposer Pattern**:
   Every subscription returns a **disposer** function. For React components, returning this disposer in `useEffect` ensures automatic cleanup on unmount, preventing memory leaks.

> [!IMPORTANT]
> This pattern transforms the Registry from a simple data store into a **Reactive Orchestrator**, making it the definitive "Master Class" solution for nested disclosure systems. 🦾🚀✨🏮

---

## Future Plans: The Path to Absolute Perfection

1. **Keyboard Navigation (Focus Management)**:
   Implementing a global focus orchestrator within the Registry to handle `ArrowUp`, `ArrowDown`, `Home`, and `End` keys, ensuring the component is 100% accessible and keyboard-friendly.
2. **Tab Integration**:
   Expanding the Registry to support a `Tabs` primitive, using the same underlying `DisclosureContext` logic for selection and transitions.
3. **Sub-Item Registry**:
   Implementing specialized sub-registries for even more complex, multi-layered disclosure panels.
