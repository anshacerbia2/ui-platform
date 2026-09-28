---
doc_meta:
  id: TDD-ui-platform-tokens-003
  title: Theme and Token Output
  owner: UI Platform Team
  version: 0.1.0
  status: draft
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-28
---

# TDD-ui-platform-tokens-003: Theme and Token Output

## Purpose

Define how three logical token tiers yield a complete, scoped, valid consumer stylesheet.

## Scope

Core values, semantic contracts, component aliases, default/achromatic theme output, font declarations, CSS custom properties, stable `@scnx/system/tokens/*` exports, and optional future DTCG interchange. Token data remains in `@scnx/system` for v1.

## Technical Context

Sass maps are the current source. Panda references some `--ds-*` names absent from Sass output. The observed baseline contains malformed `low` and `focus` shadows, a `--ds-shadow-lg` reference without a matching public definition, and an invalid achromatic expression. OKLCH authoring alone cannot prove contrast; alpha depends on the actual background.

## Component Design

Tier 1 contains raw scales. Tier 2 uses `color.{scheme}.{role}.{emphasis}.{state}` for color and `{domain}.{property}.{intent}` for dimension, typography, and motion. Tier 3 uses `{component}.{element?}.{property}.{state?}`. CSS output prefixes `--ds-` and hyphenates the logical path. A single versioned dictionary generates Sass-facing and Panda-facing names. Sass remains the source until a DTCG generator and migration test replace it. Brand overrides inherit declared baseline keys inside `[data-scnx-theme]` roots.

## Data Model

Each public token records name, type, tier, semantic purpose, theme/state coverage, source location, generated CSS name, and deprecation status. Font entries record family, supported weights/styles, asset path, and license. Component aliases record their Tier-2 fallback and justification.

## API / Interface

Public web tokens are documented `--ds-*` variables, `@scnx/system/tokens/*` subpaths, and CSS theme exports. DTCG 2025.10 is a Community Group Final Report and the target interchange model; current Sass maps do not claim conformance. The [dimension guide](../07-guides/GD-ui-platform-002-dimension-spacing-scale.md) records current scale versus proposed semantic aliases.

## Algorithms / Logic

Compile core values → resolve semantic mappings → apply scoped brand overrides → emit CSS custom properties → validate syntax and references → compute representative consuming properties in a browser. Serialize Sass lists according to the target CSS property's grammar; `meta.inspect` is not a general CSS serializer.

## Configuration

Declared themes, browser support, color fallback policy, font formats, and selector roots are versioned. A theme may omit an overridden key only when inheritance from the baseline is explicit and tested.

## Testing Strategy

Source checks validate legal roles, canonical names, generated Sass/Panda parity, and references. Packed tests parse output and fail on every undefined public variable or invalid consuming property after substitution, including shadow key mismatches. Browser tests compute shadows, colors, typography, spacing, and font family in each theme. Contrast tests cover actual pairs and states against WCAG 2.2 SC 1.4.3 and SC 1.4.11. Two brand roots are rendered together to catch leakage.

## Performance Notes

Record emitted CSS size and unused generated variants by import path. Token count and CSS bytes are measured rather than inferred from taxonomy.

## Security Notes

Token files contain no secrets. Consumer override APIs must not silently allow arbitrary executable content.

## Operational Notes

Token renames and semantic changes are versioned; migration maps and release conformance records identify affected consumers.

## Traceability

Parent: SAD-003. Governing ADRs: ADR-UIP-TKN-001/002/003; review drafts: STD-UIP-TKN-001/002. Implements UIP-DEC-002, UIP-DEC-003, and UIP-DEC-005 with P0 items 3 and 4.
