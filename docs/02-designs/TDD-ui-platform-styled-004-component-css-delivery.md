---
doc_meta:
  id: TDD-ui-platform-styled-004
  title: Styled Components and CSS Delivery
  owner: UI Platform Team
  version: 0.1.0
  status: draft
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-28
---

# TDD-ui-platform-styled-004: Styled Components and CSS Delivery

## Purpose

Define the seam between headless behavior, styled wrappers, theme variables, and the CSS a consumer must load.

## Scope

`@scnx/system` component entries, Sass component rules, Panda recipes, reset/base rules, style exports, and documented consumer imports.

## Technical Context

The baseline combines Sass classes with Panda recipes. A JS component entry does not by itself prove the corresponding CSS is loaded; the current theme bundles may lack component rules. Component SCSS outside declared cascade layers can conflict with consumer utilities. Unscoped `:root` or element resets can affect neighboring remotes.

## Component Design

Styled wrappers compose `@scnx/core-ui` behavior and own visual variants. Component source uses semantic tokens or justified component aliases. `@scnx/system` exports one aggregate component stylesheet and explicit theme stylesheets. A host or standalone composition root imports each required stylesheet once. Component JS has no CSS side-effect import, and federated remotes do not inject another copy. This is the **P0 target**, not an implemented claim. Optional per-component CSS subpaths may follow only with export and consumer-size evidence.

Sass owns skinned component rules in the current baseline; Panda owns declared structural recipes. Both read one token contract. `@scnx/core-ui` remains headless and contains no Panda callsite; after verification, Panda does not scan its source. The ownership and cascade order are tested. Styling-engine consolidation remains a measured decision, not a prerequisite for P0.

## Data Model

For each styled component: public JS entry, primitive dependency, visual states, token references, CSS owner, CSS artifact, theme coverage, and accessibility behavior inherited or added. The import manifest maps each documented consumer path to its published file.

## API / Interface

Public styling API comprises class/data attributes that are intentionally stable, documented theme scope, token variables, aggregate component CSS, and explicit theme stylesheet entries. Internal SCSS class structure is not a compatibility promise unless documented. Reset rules are scoped below `.scnx-root` or the documented equivalent; they do not target unrelated host or remote elements.

## Algorithms / Logic

Compile Sass and Panda in the producer workspace → compose theme/component CSS in declared order → publish and export the assets → install the tarball → import JS plus component/theme CSS once at the composition root → render and inspect computed styles. A packed consumer never invokes Panda. A cascade layer sets priority only; selector prefixes or scoped roots provide isolation.

## Configuration

Panda `staticCss` generation is profiled. Theme selectors, reset boundaries, and layer order are declared once. Portaled content receives an explicit container inside the active theme scope or an equivalent documented propagation mechanism. Consumer overrides have a documented precedence slot.

## Testing Strategy

A packed consumer renders Button, one layout, and one compound widget under each supported theme. A federated fixture loads multiple remotes in different orders. Tests verify component styling, missing variables, CSS import resolution, one intended stylesheet set, deterministic cascade order, portal theming, override precedence, two brand roots, and absence of host leakage. Visual snapshots supplement computed-style assertions.

## Performance Notes

Measure full-theme CSS, a representative route, individual component CSS if offered, generated variant cost, and build time. The result decides whether dual engines remain.

## Security Notes

No runtime string evaluation is required for style generation. CSP behavior is tested with the ThemeProvider design.

## Operational Notes

Changing a public CSS entry, token name, or selector contract requires compatibility review and migration guidance.

## Traceability

Parent: SAD-003. Governing review drafts: STD-UIP-STY-001 and STD-UIP-ENG-001. P0 item 5 and styling-engine decision. This supersedes the UI Platform direction in read-only microfrontend TDD-SCNX-UI-JS-004.
