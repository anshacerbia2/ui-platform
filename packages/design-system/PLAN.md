# Scnehaux Design System - Enterprise Implementation Backlog (Jira-Ready)

**Review Level**: Principal UI/UX Architect / Staff Engineer  
**Architecture**: Multi-Brand Federated Design System (`@scnx/system` & `@scnx/core-ui`)  
**Compliance Target**: WCAG 2.2 AA, WAI-ARIA Authoring Practices, Section 508

**Status**: 
- Epic 1: Design Tokens & Compiler Setup (COMPLETED)
- Epic 2: Mathematical Code Generators (COMPLETED)
- Epic 3: High-Performance GPU Transition Engine (COMPLETED)
- Epic 4: Layout & Grid Primitives (COMPLETED)
- Epic 5: Baseline Atoms & Presentational Elements (COMPLETED)
- Epic 6: Complex Interactive Organisms (COMPLETED)
- Epic 7: Multi-Brand Theme Contract Validation (TODO)
- Epic 8: Component Accessibility & WCAG 2.2 AA Auditing (TODO)
- Epic 9: Module Federation Downstream Scanners (TODO)

---

## 🏛️ Authoritative Documentation Registry

Our complete, formal architectural blueprints are divided into specialized, linter-compliant enterprise specifications:

| Document | Type | Purpose | Reference Link |
| :--- | :--- | :--- | :--- |
| **Platform Architecture** | PAD-002 | Platform Architecture Document for Scnehaux UI Platform and design token schema. | [scnehaux-ui-platform.pad.md](file:///D:/Ansha/architecture-description/scnehaux-architecture/02-platform/scnehaux-ui-platform/scnehaux-ui-platform.pad.md) |
| **Software Architecture** | SAD-003 | Software Architecture Document for UI compilers, workspace configurations, and failure recovery. | [scnehaux-ui-platform.sad.md](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md) |
| **Domain-Based Taxonomy** | ADR-E008 | Root Architecture Decision Record defining namespaced Design Token Taxonomy. | [ADR-E008](file:///D:/Ansha/architecture-description/scnehaux-architecture/04-decisions/ADR-E008-domain-based-design-token-taxonomy.md) |
| **Zero-Reflow Transition Engine** | ADR-SCNX-UI-JS-001 | Architectural Decision Record on high-performance DOM transition mechanics. | [ADR-SCNX-UI-JS-001](../docs/04-decisions/ADR-SCNX-UI-JS-001-zero-reflow-transition-engine.md) |
| **Dual-Axis Palette Engine** | ADR-SCNX-UI-JS-002 | Architectural Decision Record on solid and alpha neutral/chromatic color grading. | [ADR-SCNX-UI-JS-002](../docs/04-decisions/ADR-SCNX-UI-JS-002-dual-axis-token-palette.md) |
| **Polymorphic as vs asChild** | ADR-SCNX-UI-JS-003 | Architectural Decision Record on polymorphic dynamic as prop preference over asChild. | [ADR-SCNX-UI-JS-003](../docs/04-decisions/ADR-SCNX-UI-JS-003-aschild-polymorphic-slot.md) |
| **TSDoc Governance Standard** | STD-SCNX-UI-JS-001 | Local engineering standard for TypeScript API and hook documentation. | [STD-SCNX-UI-JS-001](../docs/05-standards/STD-SCNX-UI-JS-001-tsdoc-governance.md) |
| **Developer Integration Standard** | STD-SCNX-UI-JS-002 | Local engineering standard for downstream package integration and overrides. | [STD-SCNX-UI-JS-002](../docs/05-standards/STD-SCNX-UI-JS-002-developer-integration-standard.md) |
| **Performance & Rendering Standard** | STD-SCNX-UI-JS-003 | Local engineering standard for frame rates, thrashing, and memory. | [STD-SCNX-UI-JS-003](../docs/05-standards/STD-SCNX-UI-JS-003-performance-rendering-standard.md) |

---

## 📋 Architectural Decisions Index (ADR Summary)

All strategic architectural decisions governing the design system packages.

| ADR | Decision | Rationale | Reference / Status |
| :--- | :--- | :--- | :--- |
| ADR-E008 📄 | Domain-Based Token Taxonomy | Decouples components from physical primitives; prevents visual flattening traps. | [ADR-E008](file:///D:/Ansha/architecture-description/scnehaux-architecture/04-decisions/ADR-E008-domain-based-design-token-taxonomy.md) |
| ADR-SCNX-UI-JS-001 📄 | Zero-Reflow Transition Engine | Enforces requestAnimationFrame queue scheduling and prevents layout thrashing. | [ADR-SCNX-UI-JS-001](../docs/04-decisions/ADR-SCNX-UI-JS-001-zero-reflow-transition-engine.md) |
| ADR-SCNX-UI-JS-002 📄 | Dual-Axis Neutral & Chromatic Palette | Standardizes solid and alpha colors using RGB space-separated variable maps. | [ADR-SCNX-UI-JS-002](../docs/04-decisions/ADR-SCNX-UI-JS-002-dual-axis-token-palette.md) |
| ADR-SCNX-UI-JS-003 📄 | Polymorphic as vs asChild | Restricts asChild pattern in hot rendering loops to avoid cloning overhead. | [ADR-SCNX-UI-JS-003](../docs/04-decisions/ADR-SCNX-UI-JS-003-aschild-polymorphic-slot.md) |

---

# Epic 1: Design Tokens & Compiler Setup
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [SAD-003 §2.1](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md#L45)

## Objective
Establish the core design token system (Tier-1, Tier-2, and Tier-3) along with the CSS build compilation pipeline.

## Description
This epic defines the foundation of the design system. It includes setting up SCSS preprocessors, building core variables, configuring the Panda CSS engine for static utility style extraction, and setting up the local workspace structure.

## Acceptance Criteria
- Token stylesheets `_core-token.scss`, `_contract-token.scss`, and `_variables.scss` are compiled to `dist/`.
- Panda CSS configuration `panda.config.ts` successfully compiles style definitions.
- Local linter audits pass.

### Story 1.1: Sass Build & Core Primitives
**Technical Pointers**:
- Define core tokens (lightness curves, dimensions, spacing, typography) in `packages/design-system/src/styles/abstracts`.
- Compile tokens into space-separated RGB custom properties to support runtime opacity overrides.

### Story 1.2: Panda CSS Config & Tooling
**Technical Pointers**:
- Configure `panda.config.ts` with custom themes, utilities, and semantic tokens.
- Map compile-time styled system outputs to the workspace distribution directory.

---

# Epic 2: Mathematical Code Generators
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [TDD-SCNX-UI-JS-002](../docs/06-designs/TDD-SCNX-UI-JS-002-dual-axis-token-generators.md)

## Objective
Implement Node.js scripts to generate color primitives dynamically based on monotonic lightness curves and reverse alpha blending.

## Description
To prevent color drift and inconsistent contrast ratios, the core color palette is programmatically compiled. The scripts solve the alpha value required for transparent tokens to match solid targets.

## Acceptance Criteria
- Running `node scripts/generate-neutral-v2.cjs` prints valid SCSS maps.
- Running `node scripts/generate-chromatic-v2.cjs` prints valid chromatic SCSS maps.
- Output colors are space-separated RGB integers.

### Story 2.1: Mathematical Solver
**Technical Pointers**:
- Implement HSL-to-RGB conversion equations.
- Solve $C_{\text{alpha}} = \frac{C_{\text{target}} - C_{\text{bg}}(1 - a)}{a}$ iteratively for $a \in [0.01, 1.00]$.

### Story 2.2: Color Grade curves
**Technical Pointers**:
- Enforce strict lightness monotonicity in arrays (lightness decreasing for light mode, increasing for dark mode).
- Cap dark mode saturation to $88\%$ maximum to prevent oversaturation.

---

# Epic 3: High-Performance GPU Transition Engine
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [TDD-SCNX-UI-JS-001](../docs/06-designs/TDD-SCNX-UI-JS-001-transition-base.md)

## Objective
Implement the `TransitionBase` component with Orthogonal FSM state management, `requestAnimationFrame` double-sync measurements, and frame-reversal mitigation.

## Description
This component provides hardware-accelerated animations (`transform` and `opacity`) for core UI overlays without triggering layout reflows during height transitions.

## Acceptance Criteria
- Interactive transitions execute in under 16.6ms per frame.
- Interrupted transitions resolve immediately without flickering or queue stacking.

### Story 3.1: State Machine & Mounting
**Technical Pointers**:
- Implement state machine hooks managing states: `closed`, `entering`, `settled`, `exiting`.
- Coordinate mounting lifecycle to apply styles before rendering classes.

### Story 3.2: Double-Sync Height Measurement
**Technical Pointers**:
- Implement `requestAnimationFrame` scheduling to read `scrollHeight` and apply fixed pixel heights in separate ticks.

---

# Epic 4: Layout & Grid Primitives
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [SAD-003 §2.2](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md#L62)

## Objective
Implement layouts and spacing containers (`Box`, `Flex`, `Grid`, `Stack`, `Container`, `EdgeLayout`, `FloatingLayout`).

## Description
Layout primitives provide developer ergonomics for responsive alignment and flex grids. They consume the token spacing standard directly to prevent custom padding/margin declarations.

## Acceptance Criteria
- Layout primitives render with minimal DOM wrappers.
- Layout attributes successfully map to CSS Flexbox and Grid rules.

### Story 4.1: Box & Flex Containers
**Technical Pointers**:
- Build responsive flex wrappers matching direction, gap, and alignment parameters.
- Resolve layouts using utility class strings.

### Story 4.2: Floating & Edge Layouts
**Technical Pointers**:
- Implement fixed overlays and absolute anchor points.
- Map positioning boundaries dynamically using floating-ui libraries.

---

# Epic 5: Baseline Atoms & Presentational Elements
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [SAD-003 §2.3](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md#L80)

## Objective
Implement fundamental presentational elements (`Button`, `Text`, `Heading`, `Divider`, `Code`, `List`).

## Description
Atoms represent the leaf nodes of the UI tree. They bind directly to Tier-3 semantic and component tokens to guarantee multi-brand capability.

## Acceptance Criteria
- Button supports default, hover, focus, active, and disabled states.
- Typographic components apply fluid typography mappings.

### Story 5.1: Interactive Button Element
**Technical Pointers**:
- Implement polymorphic tags (rendering `button`, `a`, or custom router link).
- Add hover/pressed overlays using translucent alpha tokens.

### Story 5.2: Typographic Families
**Technical Pointers**:
- Map font families, tracking, and leading using heading and text wrappers.

---

# Epic 6: Complex Interactive Organisms
**Epic Status**: ✅ COMPLETED  
**Design Doc**: [SAD-003 §2.2](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md#L62)

## Objective
Compose complex interactive layout modules (`Accordion`, `Navbar`, `Sidebar`, `Navigation`, `CodeSelect`, `CodeShowcase`, `TableOfContents`).

## Description
Organisms compose multiple atoms and layouts into functional page features. They handle collapsible states, sidebar toggling, and multi-step tab navigation.

## Acceptance Criteria
- Accordion handles multiple panels with smooth heights.
- Sidebar collapses and expands cleanly utilizing `TransitionBase`.

### Story 6.1: Responsive Navigation & Sidebars
**Technical Pointers**:
- Implement drawer toggles with click-outside hooks.
- Persist expanded/collapsed preferences across route transitions.

### Story 6.2: Code Showcases & Tab Selectors
**Technical Pointers**:
- Build syntax highlighting container wrappers.
- Sync active code selection tabs across multiple showcases.

---

# Epic 7: Multi-Brand Theme Contract Validation
**Epic Status**: TODO  
**Governing Docs**: [STD-SCNX-UI-JS-002 §4](../docs/05-standards/STD-SCNX-UI-JS-002-developer-integration-standard.md#L45)

## Objective
Build tooling to validate custom brand JSON overrides and CSS variables against the default contract token schema.

## Description
Downstream clients can override brand colors. To prevent broken views, a build-time validator must verify that the overridden properties contain a valid schema.

## Acceptance Criteria
- A validation script checks that all semantic custom property variables match the expected contract.
- Any missing variable keys in custom overrides throw a compilation error.

### Story 7.1: Validator Script
**Technical Pointers**:
- Implement validation checks that parse custom JSON overrides.
- Confirm override shapes against `$contract-tokens` values.

---

# Epic 8: Component Accessibility & WCAG 2.2 AA Auditing
**Epic Status**: TODO  
**Governing Docs**: [scnehaux-ui-platform.pad.md §8](file:///D:/Ansha/architecture-description/scnehaux-architecture/02-platform/scnehaux-ui-platform/scnehaux-ui-platform.pad.md#L125)

## Objective
Integrate automated accessibility testing (axe-core) and enforce semantic keyboards across interactive controls.

## Description
To ensure compliance with accessibility regulations, interactive components (modals, accordions, dropdowns) must handle arrow key navigation, focus traps, and screen-reader announcements.

## Acceptance Criteria
- Lighthouse accessibility score remains at $100$.
- Component unit tests verify keyboard focus locks.

### Story 8.1: Focus Trap Hook
**Technical Pointers**:
- Write a hook to trap tab keys within active overlays (modals, dropdowns).
- Return focus to the trigger element upon modal closure.

---

# Epic 9: Module Federation Downstream Scanners
**Epic Status**: TODO  
**Governing Docs**: [SAD-003 §4](file:///D:/Ansha/architecture-description/scnehaux-architecture/03-applications/scnehaux-ui-platform/scnehaux-ui-platform.sad.md#L140)

## Objective
Deploy compile-time scanners in down-stream micro-frontends to block ad-hoc styling and enforce design system tokens.

## Description
To maintain look-and-feel consistency across multiple micro-frontends, downstream applications are audited during build time. The build scanner rejects files containing hardcoded colors or ad-hoc margins.

## Acceptance Criteria
- Build system blocks downstream projects that use unauthorized tailwind class names or raw HEX codes.
- CI pipeline triggers a soft warning or hard exit on violations.

### Story 9.1: CSS AST Scan
**Technical Pointers**:
- Build a PostCSS plugin or Panda CSS lint configuration.
- Check style compilation steps for unauthorized color strings.
