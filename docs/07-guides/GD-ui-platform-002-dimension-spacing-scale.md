# Guide: dimension and spacing scale

Status: code-grounded baseline plus review guidance, 2026-09-28. This fills the subject left empty by read-only microfrontend guide GD-SCNX-UI-JS-002. The source of current values is `packages/design-system/src/styles/abstracts/_core-token.scss`; the semantic mapping is in `src/styles/themes/default/_default-token.scss`.

## Current core spacing

| Core key | Value      |
| -------- | ---------- |
| `0`      | `0`        |
| `0_5`    | `0.125rem` |
| `1`      | `0.25rem`  |
| `2`      | `0.5rem`   |
| `3`      | `0.75rem`  |
| `4`      | `1rem`     |
| `5`      | `1.25rem`  |
| `6`      | `1.5rem`   |
| `8`      | `2rem`     |
| `10`     | `2.5rem`   |
| `12`     | `3rem`     |
| `16`     | `4rem`     |
| `20`     | `5rem`     |

The current default semantic spacing map is `3xs→0_5`, `2xs→1`, `xs→2`, `sm→3`, `md→4`, `lg→6`, `xl→8`, `2xl→12`, `3xl→16`, and `4xl→20`. These are implementation facts, not proof that every consumer uses the intended size.

## Usage

- Use semantic spacing variables for shared component rhythm. Core keys are source inputs, not public shortcuts.
- Use semantic control and icon sizes where their intent fits. Intrinsic sizes, percentages, content-based widths, breakpoints, and a justified local numeric value remain valid layout tools; forcing every measurement into a shared token would create misleading names.
- Responsive reflow is verified at the consumer viewport and content length. A dimension token by itself does not prevent overflow or layout shift.
- `rem` scales with root font size; test text enlargement and consumer root settings. Pixel-based borders and breakpoints need their own rationale.

## Change protocol

A spacing change records affected semantic aliases, components, screenshots, viewport scenarios, and migration impact. A public alias rename is a compatibility change. The packed browser test checks that every emitted spacing variable resolves to a valid length where consumed.

See [the token TDD](../designs/TDD-ui-platform-tokens-003-theme-and-token-output.md). The CSS custom-property names emitted by the build, not the Sass map keys, are the public web contract.
