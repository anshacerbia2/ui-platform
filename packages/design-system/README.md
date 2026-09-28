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

The styling owner and future Sass/Panda balance are open decisions. See the [working consensus](../../docs/architecture/WORKING_CONSENSUS.md) and [decision register](../../docs/architecture/DECISION_REGISTER.md).
