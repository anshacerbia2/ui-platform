---
doc_meta:
  id: TDD-ui-platform-theme-005
  title: Theme Provider, Transitions, and Disclosure
  owner: UI Platform Team
  version: 0.1.0
  status: draft
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-28
---

# TDD-ui-platform-theme-005: Theme Provider, Transitions, and Disclosure

## Purpose

Define theme state and transition behavior that works under strict CSP, SSR, multiple providers, and federated consumers.

## Scope

ThemeProvider, theme root attributes, persistence/preference handling, portal propagation, OFSM transitions, disclosure registry, and related browser effects. The working contract uses scoped subtree themes; formal ratification remains pending.

## Technical Context

The baseline evaluates script text through `new Function` and assigns one global `window.__onThemeChange` callback. Multiple providers can overwrite each other, and a strict CSP can reject evaluation. An inline bootstrap script also requires an explicit nonce/hash or external-script strategy. Transition code reads layout synchronously; cost must be measured rather than declared zero. A Disclosure registry race is suspected but unproven.

## Component Design

Each provider owns a named theme root or subscribes to an explicit shared store selected by the host. It never implicitly owns every provider on `window`. Its visual state is reflected on the root via a documented attribute; CSS variables and resets are scoped below that root. Persistence keys and system preference listeners belong to a clearly identified authority, with cleanup. A host may opt into document-wide theme behavior, but that mode is not presented as multi-brand isolation. Overlay components receive a portal container inside the active theme root or propagate the same theme contract to an explicit portal root.

OFSM transitions expose state and callbacks with interrupt semantics. The component cleans animation frames and listeners. Disclosure registry operations are deterministic under register/unregister, rapid toggle, and controlled/uncontrolled modes.

## Data Model

Theme state: theme ID, mode, root element, source of truth, subscription set, and persistence policy. Transition state: entering, settled, exiting, closed, plus documented interruption flags. Disclosure state: item ID, open/closing state, registration lifetime.

## API / Interface

Provider props document root scope, portal container/root, initial theme, controlled theme, preference policy, and change callback. External shells interact through this API or an explicit store, never undocumented window globals. Transition and disclosure public props consume their own configuration before spreading DOM props.

## Algorithms / Logic

Resolve server-safe initial state → hydrate without mismatched markup → subscribe to the chosen store/preference source → apply root attribute → notify local subscribers → clean up. For transitions, dispatch a state event, schedule only necessary frame work, and settle on the element's own completion event or disabled-motion branch. Every callback fires according to a tested state table.

## Configuration

Supported themes and mode names are versioned. CSP policy is supplied by the consumer test harness. Any prepaint bootstrap uses an approved external asset or host-controlled nonce/hash; it never requires `unsafe-eval`.

## Testing Strategy

Two providers with distinct themes coexist in one DOM. A modal and tooltip portal retain the originating theme without leaking into the neighboring root. Strict CSP, SSR/hydration, preference changes, persistence, interrupted transitions, reduced motion, and disclosure timing are tested. Browser traces record forced layout and frame cost in named scenarios. Packed shell/remote tests confirm context identity.

## Performance Notes

No absolute zero-reflow or sub-50 ms promise. Measure theme-switch interaction and transition traces on declared devices and workloads.

## Security Notes

Remove `new Function` and global mutable callbacks. An inline script is allowed only under the consumer's explicit CSP policy and documented host integration.

## Operational Notes

If theme initialization fails, retain a valid baseline theme and report the failure in the consumer fixture. A broken provider blocks stable promotion.

## Traceability

Parent: SAD-003. Governing review drafts: STD-UIP-ENG-001, STD-UIP-STY-001, and STD-UIP-PRM-001. P0 items 7 and 10. This supersedes the UI Platform direction in read-only microfrontend TDD-SCNX-UI-JS-005.
