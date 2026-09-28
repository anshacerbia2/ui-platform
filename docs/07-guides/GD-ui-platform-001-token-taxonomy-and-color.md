# Guide: token taxonomy and color

Status: guidance for the proposed UI Platform contract, 2026-09-28. Normative authority remains ADR-UIP-TKN-001/002/003 and STD-UIP-TKN-001/002 in the canonical architecture repository.

## Three levels

1. **Core:** raw value or scale, without product intent.
2. **Semantic:** stable visual intent such as a surface, text role, focus border, or spacing purpose.
3. **Component:** an alias only when a component needs independently governed behavior.

These are **logical levels**. They currently live inside `@scnx/system`; they are not three published packages. A product state can map to an existing semantic role or remain product-local. It does not automatically become a global token.

## Color authoring

The baseline uses OKLCH channels in Sass. OKLCH helps author and transform color; it does not guarantee readable text or valid CSS. Validate emitted color syntax, alpha on actual backgrounds, and contrast of the pairs used by components in every supported theme and state. A partial brand override must inherit baseline keys within a documented root. Two roots with different brands are a required integration scenario.

The DTCG 2025.10 format is a future interchange target. A DTCG source can become canonical only when it generates the Sass, Panda, and CSS contracts reproducibly and the packed consumer still passes. Until then, the Sass token maps are the current source.

## Naming review

For each proposed token, document its type, tier, intent, states, theme coverage, fallback, consumer examples, and migration impact. Reject aliases that merely rename an existing semantic role. Do not impose an arbitrary count of aliases per component.

See [the token TDD](../designs/TDD-ui-platform-tokens-003-theme-and-token-output.md) for compilation and release tests. The read-only microfrontend guide GD-SCNX-UI-JS-001 is historical material, not the UI Platform's current authority.
