---
doc_meta:
  id: TDD-ui-platform-tokens-003
  title: Theme and Token Output
  owner: UI Platform Team
  version: 0.2.0
  status: proposed
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-29
---

# TDD-ui-platform-tokens-003: Theme and Token Output

## Purpose

Define how three logical token tiers yield a complete, scoped, valid consumer stylesheet.

## Scope

Core values, semantic contracts, component aliases, default/achromatic theme output, font declarations, CSS custom properties, stable `@scnx/system/tokens/*` exports, and optional future DTCG interchange. Token data remains in `@scnx/system` for v1.

## Technical Context

Sass maps are the current source. Panda references some `--ds-*` names absent from Sass output. The observed baseline contains malformed `low` and `focus` shadows, different shadow key sets per theme (`low`/`medium`/`high`/`overlay`/`focus` in default, `sm`/`md`/`lg`/`xl` in achromatic, so `--ds-shadow-lg` and `--ds-shadow-low` each resolve in only one theme), legacy names such as `--ds-color-primary-solid-default-default` that do not follow the canonical grammar, and an invalid achromatic expression. OKLCH authoring alone cannot prove contrast; alpha depends on the actual background.

## Component Design

The grammar is defined once in STD-UIP-TKN-001. Tier 2 color is `color.{scheme}.{role}.{emphasis}.{state}` (canonical example `color.primary.surface.solid.default`, emitted as `--ds-color-primary-surface-solid-default`). Every theme emits the identical public shadow set `effect.shadow.low|medium|high|overlay|focus`; Tier-1 `effect.shadow.sm|md|lg|xl` stays internal. Z-index uses `dimension.z-index.{step}` (Tier 1), `dimension.z-index.modal` (Tier 2), and `dialog.root.z-index.default` (Tier 3). A focus shadow may supplement but never replace the required visible `outline` indicator. Legacy names are renamed in P0 without compatibility aliases. A single versioned dictionary generates Sass-facing and Panda-facing names. Sass remains the source until a DTCG generator and migration test replace it. Brand overrides inherit declared baseline keys inside `[data-scnx-theme]` roots.

## Data Model

Each public token records name, type, tier, semantic purpose, theme/state coverage, source location, generated CSS name, and deprecation status. Font entries record family, supported weights/styles, asset path, and license. Component aliases record their Tier-2 fallback and justification.

## API / Interface

Public web tokens are documented `--ds-*` variables, `@scnx/system/tokens/*` subpaths, and CSS theme exports. DTCG 2025.10 is a Community Group Final Report and the target interchange model; current Sass maps do not claim conformance. STD-UIP-TKN-001 owns the canonical grammar and scale; this TDD owns only its implementation and verification.

## Algorithms / Logic

Compile core values → resolve semantic mappings → apply scoped brand overrides → emit CSS custom properties → validate syntax and references → compute representative consuming properties in a browser. Serialize Sass lists according to the target CSS property's grammar; `meta.inspect` is not a general CSS serializer.

## Configuration

Declared themes, browser support, color fallback policy, font formats, and selector roots are versioned. A theme may omit an overridden key only when inheritance from the baseline is explicit and tested.

## Testing Strategy

Source checks validate legal roles, canonical names, generated Sass/Panda parity, and references. Packed tests parse output and fail on any emitted name outside the grammar, any Tier-2 key-set difference between themes, any undefined public variable, and any invalid consuming property after substitution. Browser tests compute shadows, colors, typography, spacing, and font family in each theme. Contrast tests cover actual pairs and states against WCAG 2.2 SC 1.4.3 and SC 1.4.11. Two brand roots are rendered together to catch leakage.

## Performance Notes

Record emitted CSS size and unused generated variants by import path, theme, build mode, tool version, and consumer baseline. Token count and CSS bytes are measured rather than inferred from taxonomy; no universal percentage or multiplier is a pass/fail rule.

## Security Notes

Token files contain no secrets. Consumer override APIs must not silently allow arbitrary executable content.

## Operational Notes

Token renames and semantic changes are versioned; migration maps and release conformance records identify affected consumers.

## Traceability

Architecture authority: SAD-003; ADR-UIP-PLT-001 and ADR-UIP-TKN-001/002/003; STD-GLB-FE-005, STD-GLB-FE-009, and STD-UIP-TKN-001/002. Each record's lifecycle status in `scnehaux-architecture` controls whether it is binding or proposed. Execution: [PLAN](../../PLAN.md) P0 row 4.
