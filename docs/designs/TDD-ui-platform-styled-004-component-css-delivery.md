---
doc_meta:
  id: TDD-ui-platform-styled-004
  title: Styled Components and CSS Delivery
  owner: UI Platform Team
  version: 0.2.0
  status: proposed
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-29
---

# TDD-ui-platform-styled-004: Styled Components and CSS Delivery

## Purpose

Define the seam between headless behavior, styled wrappers, theme variables, and the CSS a consumer must load.

## Scope

`@scnx/system` component entries, Sass component rules, Panda recipes, reset/base rules, style exports, and documented consumer imports.

## Technical Context

The baseline combines Sass classes with Panda recipes. A JS component entry does not by itself prove the corresponding CSS is loaded; the current theme bundles may lack component rules. Component SCSS outside declared cascade layers can conflict with consumer utilities. Unscoped `:root` or element resets can affect neighboring remotes.

## Component Design

Styled wrappers compose `@scnx/core-ui` behavior and own visual variants. Component source uses semantic tokens or justified component aliases. `@scnx/system` exports one aggregate component stylesheet and explicit theme stylesheets. A host or standalone composition root imports each required stylesheet once. Component JS has no CSS side-effect import, and federated remotes do not inject another copy. Per-component CSS subpaths are outside the v1 public contract.

Sass owns skinned component rules in the current baseline; Panda owns its existing structural recipes and adds no new recipe surface during P0. Both contracts are generated from one token source. `@scnx/core-ui` remains headless and contains no Panda callsite; after verification, Panda does not scan its source. Sass component rules belong to `components` and Panda recipes belong to `recipes` in the canonical layer order. The two-engine model remains eligible only if every CSS correctness, layering, duplicate-declaration, build-time, CSP, and approved consumer performance gate passes. If the boundary causes a gate failure, consolidate on the eligible engine; if neither engine qualifies, block stable promotion.

## Data Model

For each styled component: public JS entry, primitive dependency, visual states, token references, CSS owner, CSS artifact, theme coverage, and accessibility behavior inherited or added. The import manifest maps each documented consumer path to its published file.

## API / Interface

Public styling API comprises documented class/data attributes, `[data-scnx-theme]` roots, token variables, aggregate component CSS, and explicit theme stylesheet entries. Internal SCSS class structure is not a compatibility promise unless documented. Reset rules are scoped below the theme root. A separate `:root` compatibility stylesheet may serve a single-brand document and is excluded from multi-brand and federated support.

## Algorithms / Logic

Compile Sass and Panda in the producer workspace → compose theme/component CSS in declared order → publish and export the assets → install the tarball → import JS plus component/theme CSS once at the composition root → render and inspect computed styles. A packed consumer never invokes Panda. A cascade layer sets priority only; selector prefixes or scoped roots provide isolation.

## Configuration

Panda `staticCss` output is measured against the recipe CSS actually referenced. The canonical order is `reset, tokens, base, components, recipes, utilities, overrides`. Portaled content receives a container inside the active `[data-scnx-theme]` root. Consumer overrides use the final layer.

## Testing Strategy

A packed consumer renders the supported v1 set under each theme. A federated fixture loads two remotes in both orders. Tests verify component styling, CSS import resolution, deterministic layers, portal theming, override precedence, two brand roots, and absence of host leakage. CI fails unless it observes exactly one aggregate component stylesheet content hash and exactly one selected theme asset in the document. Visual snapshots supplement computed-style assertions.

## Performance Notes

Measure full-theme CSS, the P2 slice route, generated variant cost, duplicate declarations, build time, and incremental consumer impact with the exact tool, runner, build mode, and baseline. The result decides whether dual engines remain. No universal 10% or 2x threshold is part of this TDD.

## Security Notes

No runtime string evaluation is required for style generation. Static assets and the ThemeProvider contract must pass the same strict CSP policy without `unsafe-eval`, `unsafe-inline`, or unowned runtime style insertion.

## Operational Notes

Changing a public CSS entry, token name, or selector contract requires compatibility review and migration guidance.

## Traceability

Architecture authority: SAD-003; ADR-GLB-FE-013 and ADR-UIP-PLT-001; STD-GLB-FE-005 and STD-UIP-STY-001/ENG-001. Each record's lifecycle status in `scnehaux-architecture` controls whether it is binding or proposed. Execution: [PLAN](../../PLAN.md) P0 row 5.
