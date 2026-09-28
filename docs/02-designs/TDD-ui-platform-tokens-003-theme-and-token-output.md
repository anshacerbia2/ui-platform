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

Core values, semantic contracts, component aliases, default/achromatic theme output, font declarations, CSS custom properties, and optional future DTCG interchange. Token data currently lives in `@scnx/system`; this TDD does not create a third package.

## Technical Context

Sass maps are the current source. Panda references some `--ds-*` names absent from Sass output. The observed baseline contains malformed `low` and `focus` shadows and an achromatic color expression. OKLCH authoring alone cannot prove contrast; alpha depends on the actual background. The active dimension guide in the old project is empty and therefore cannot define a scale.

## Component Design

Tier 1 contains raw scales; Tier 2 names shared intent and supported role/state combinations; Tier 3 aliases only independently governed component intent. A single versioned token dictionary generates both Sass-facing and Panda-facing names. Until a DTCG source is implemented and validated, Sass is explicitly the source. Brand overrides inherit declared baseline keys within a theme root. The selector strategy must support two roots with different brands in one DOM before multi-brand support is claimed.

## Data Model

Each public token records name, type, tier, semantic purpose, theme/state coverage, source location, generated CSS name, and deprecation status. Font entries record family, supported weights/styles, asset path, and license. Component aliases record their Tier-2 fallback and justification.

## API / Interface

Public web tokens are documented `--ds-*` variables and CSS theme exports. Any future DTCG JSON is an interchange artifact, not a claim that present Sass maps already conform. The [dimension guide](../07-guides/GD-ui-platform-002-dimension-spacing-scale.md) records current scale versus proposed semantic aliases.

## Algorithms / Logic

Compile core values → resolve semantic mappings → apply scoped brand overrides → emit CSS custom properties → validate syntax and references → compute representative consuming properties in a browser. Serialize Sass lists according to the target CSS property's grammar; `meta.inspect` is not a general CSS serializer.

## Configuration

Declared themes, browser support, color fallback policy, font formats, and selector roots are versioned. A theme may omit an overridden key only when inheritance from the baseline is explicit and tested.

## Testing Strategy

Source checks validate legal roles, references, and naming. Packed tests parse output, find undefined variable references, and compute shadows, colors, typography, spacing, and font family in each supported theme. Contrast tests use actual foreground/background pairs and states. Two brand roots are rendered together to catch leakage.

## Performance Notes

Record emitted CSS size and unused generated variants by import path. Token count and CSS bytes are measured rather than inferred from taxonomy.

## Security Notes

Token files contain no secrets. Consumer override APIs must not silently allow arbitrary executable content.

## Operational Notes

Token renames and semantic changes are versioned; migration maps and release conformance records identify affected consumers.

## Traceability

Parent: SAD-003. Governing ADRs: ADR-UIP-TKN-001/002/003; review drafts: STD-UIP-TKN-001/002. P0 items 3 and 4. This supersedes the UI Platform direction in read-only microfrontend TDD-SCNX-UI-JS-003.
