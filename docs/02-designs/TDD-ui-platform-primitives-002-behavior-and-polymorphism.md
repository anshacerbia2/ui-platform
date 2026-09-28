---
doc_meta:
  id: TDD-ui-platform-primitives-002
  title: Primitive Behavior and Polymorphism
  owner: UI Platform Team
  version: 0.1.0
  status: draft
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-28
---

# TDD-ui-platform-primitives-002: Primitive Behavior and Polymorphism

## Purpose

Define a testable headless component contract independent of `@scnx/system` styling and any specific third-party foundation.

## Scope

The exported `@scnx/core-ui` layout primitives, action/link primitives, disclosure, navigation, TOC, overlay/transition helpers, contexts, and hooks. Product business meaning remains outside this package.

## Technical Context

The baseline has `as`, `asChild`, and fixed-element APIs. A native button or valid link already has keyboard behavior; composite widgets require their own pattern. The present source tests cover only a fraction of exported interactions. TOC ID reuse, unused initial selection, prop forwarding, and keyboard semantics are known review items.

## Component Design

Each public widget records: semantic root element, anatomy, controlled/uncontrolled state, focus order, required and optional keys, disabled behavior, accessible name, ref target, cleanup behavior, and stable `data-*` styling hooks. Native elements are the default. Polymorphism is opt-in per component and cannot erase native meaning. `asChild` is the preferred candidate where polymorphism is required; dynamic `as` is not expanded in new APIs. The final choice remains pending measured API and provenance review, so no consumer should infer universal support.

The package's dependency direction is one-way: `core-ui` has no import from `system`. Simple primitives use native/custom behavior. Selected React Aria hooks may implement high-risk composite widgets only after component-level comparison and provenance review. Vendor types and APIs never appear in the public contract.

## Data Model

State belongs to the component instance or an explicit provider context. IDs identify distinct DOM targets: a TOC navigation link does not reuse a heading ID. Registry entries have registration, update, and cleanup lifecycles; unmount and rapid remount are covered by tests.

## API / Interface

The current manifest declares `components/*`, `hooks/*`, and `providers/*` subpaths. Public types describe the rendered element and ref. Component-only props are consumed before DOM spread; unknown attributes are not leaked to native elements.

## Algorithms / Logic

For each interaction: dispatch input → update bounded state → reflect ARIA and `data-*` state → move focus where the widget pattern requires → clean subscriptions/frames on close or unmount. Event merging for any Slot-like composition preserves both consumer and library handlers according to a documented order. Invalid multi-child use fails with a tested diagnostic boundary rather than undefined cloning behavior.

## Configuration

The behavior matrix is versioned with the component inventory. React support and peer ranges are declared by tested consumer versions, including a federated context-identity fixture.

## Testing Strategy

Source tests exercise native and composite keyboard behavior, focus restoration, state transitions, controlled state, ID uniqueness, prop filtering, and registry races. Polymorphism tests cover TypeScript props, ref targets, handler order, semantic tags, and single-child failure. Packed tests verify subpath/type resolution, refs, and DOM output. Assistive-technology results are recorded in a Component ACR per stable complex widget; page-level WCAG conformance stays with the consuming page.

## Performance Notes

Measure subscription and render behavior on representative widget workloads. Cloning, a ref callback, or a geometry read is assessed by traces, not rejected by name alone. Any size threshold identifies its subpath, build mode, compression, measurement tool, and incremental consumer scenario.

## Security Notes

No primitive contains business authorization. User-provided text is rendered through React's normal escaping path unless an explicit reviewed rich-content API says otherwise.

## Operational Notes

Widgets with unresolved required behavior remain experimental or unexported from the stable channel. `Slot.tsx` requires a provenance and license decision before an `asChild` API is promoted.

## Traceability

Parent: SAD-003. Governing review draft: STD-UIP-PRM-001. P0 item 10 and the public polymorphism/React Aria entries in the [decision register](../architecture/DECISION_REGISTER.md). This supersedes the UI Platform direction in the read-only microfrontend TDD-SCNX-UI-JS-002.
