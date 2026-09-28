---
doc_meta:
  id: TDD-ui-platform-theme-005
  title: Theme Provider, Transitions, and Disclosure
  owner: UI Platform Team
  version: 0.2.0
  status: proposed
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-29
---

# TDD-ui-platform-theme-005: Theme Provider, Transitions, and Disclosure

## Purpose

Define theme state and transition behavior that works under strict CSP, SSR, multiple providers, and federated consumers.

## Scope

ThemeProvider, `[data-scnx-theme]` roots, persistence/preference handling, portal containers, OFSM transitions, disclosure registry, and related browser effects.

## Technical Context

The baseline evaluates script text through `new Function` and assigns one global `window.__onThemeChange` callback. Multiple providers can overwrite each other, and a strict CSP can reject evaluation. An inline bootstrap script also requires an explicit nonce/hash or external-script strategy. Transition code reads layout synchronously; cost must be measured rather than declared zero. A Disclosure registry race is suspected but unproven.

## Component Design

Each provider owns a `[data-scnx-theme="<theme-id>"]` root or subscribes to an explicit store selected by the host. It never owns every provider on `window`. CSS variables and resets stay below that root. A separate `:root` compatibility stylesheet may support a single-brand document and is excluded from multi-brand and federated claims. Shadow DOM is outside v1. Persistence keys and system-preference listeners have one identified authority and cleanup. Overlay components receive a portal container inside the active theme root.

OFSM transitions expose state and callbacks with interrupt semantics. The component cleans animation frames and listeners. Disclosure registry operations are deterministic under register/unregister, rapid toggle, and controlled/uncontrolled modes.

## Data Model

Theme state: theme ID, mode, root element, source of truth, subscription set, and persistence policy. Transition state: entering, settled, exiting, closed, plus documented interruption flags. Disclosure state: item ID, open/closing state, registration lifetime.

## API / Interface

Provider props document root scope, portal container/root, initial theme, controlled theme, preference policy, and change callback. External shells interact through this API or an explicit store, never undocumented window globals. Transition and disclosure public props consume their own configuration before spreading DOM props.

## Algorithms / Logic

Resolve server-safe initial state → hydrate without mismatched markup → subscribe to the chosen store/preference source → apply the root attribute → notify local subscribers → clean up. For transitions, dispatch a state event, schedule required frame work, and settle on the element's own `transitionend`/`animationend` event, a reduced-motion branch, or a bounded timeout fallback. Interruption and unmount cancel all pending work.

## Configuration

Supported themes and mode names are versioned. CSP policy is supplied by the consumer test harness. The `csp` fixture serves `script-src` and `style-src` without `unsafe-eval` or `unsafe-inline`. Any prepaint bootstrap is an external asset or runs through a consumer-controlled nonce or hash. The provider never injects an unhashed `<style>` element; theme CSS ships as static assets. When the conditional federation fixture is evaluated, the host propagates the same consumer-controlled nonce or hash through remote-entry and dynamic-chunk loading; a runtime that cannot do so is ineligible.

## Testing Strategy

Two providers with distinct themes coexist in one DOM (`fixtures/consumers/themes`). A modal and tooltip portal retain the originating theme without leaking into the neighboring root. Strict CSP with zero violation reports, an import-only test showing no effect at module evaluation, SSR/hydration with zero mismatches, preference changes, persistence, a missing completion event that settles through the bounded timeout, interrupted transitions, reduced motion, unmount cleanup, and exactly-once callbacks are tested. The standalone fixture is mandatory; the federation fixture is an `assess`-stage evaluation and does not authorize adoption. Browser traces record forced layout and frame cost in named scenarios. Packed shell/remote tests confirm context identity.

## Performance Notes

No absolute zero-reflow or sub-50 ms promise. Measure theme-switch interaction and transition traces on declared devices and workloads.

## Security Notes

Remove `new Function` and global mutable callbacks. An inline script runs only through a nonce or hash that the consumer controls; the package never requires `unsafe-eval` or `unsafe-inline`.

## Operational Notes

If theme initialization fails, retain a valid baseline theme and report the failure in the consumer fixture. A broken provider blocks stable promotion. A federation-specific CSP failure blocks federation support; it never permits weakening the standalone security policy.

## Traceability

Architecture authority: SAD-003; ADR-GLB-FE-012, ADR-GLB-FE-013, and ADR-UIP-PLT-001; STD-GLB-FE-003 and STD-UIP-ENG-001/STY-001/PRM-001. Each record's lifecycle status in `scnehaux-architecture` controls whether it is binding or proposed. Execution: [PLAN](../../PLAN.md) P0 rows 6, 9, and 10.
