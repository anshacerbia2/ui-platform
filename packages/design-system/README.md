# @scnx/system

Design tokens, themes, styled React components, and compiled CSS for the [UI Platform](../../README.md). The current physical package contains Tier 1 and Tier 2 token source plus Tier 3 component styling aliases. It depends on `@scnx/core-ui`.

## Status

Extracted baseline for principal review. Type checking passes, while the test script is a placeholder and the first standalone build ran out of default Node heap during declaration generation. CSS serialization, font contracts, CSS delivery, RSC, CSP, and multi-brand behavior remain in [P0](../../PLAN.md). This is not an approved global release.

## Public imports

The manifest currently declares theme and style subpaths, `./components`, and a wildcard subpath. Those declarations are hypotheses until an isolated packed-package consumer verifies JS, types, CSS, fonts, and styled rendering. Consumers should not assume that a component JS import automatically loads its CSS.

## Development

From the workspace root:

```sh
pnpm install
pnpm --filter @scnx/system exec tsc --noEmit
pnpm --filter @scnx/system build
```

ADR-UIP-PLT-001 owns the bounded Sass/Panda decision; the [styled-components TDD](../../docs/designs/TDD-ui-platform-styled-004-component-css-delivery.md) owns its component design and evidence gates.
