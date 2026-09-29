# @scnx/core-ui

Headless React primitives and reusable interaction behavior. This package is the primitive boundary of the [UI Platform](../../README.md). It does not import `@scnx/system`.

## Status

Extracted baseline for principal review. The current source test suite passes 10 tests, but exposed composite widgets and published-package behavior still need the [P0 gate](../../PLAN.md). The package is not approved for a global stable release.

## Public imports

The current manifest exposes `@scnx/core-ui/components/*`, `@scnx/core-ui/hooks/*`, and `@scnx/core-ui/providers/*` from generated `dist` files. There is no root export. Installable tarball resolution and supported subpaths are still being verified; an internal source path is not necessarily a public import.

## Development

From the workspace root:

```sh
pnpm install
pnpm --filter @scnx/core-ui test:run
pnpm --filter @scnx/core-ui build
```

The central ADR-UIP-PLT-001 owns interaction-foundation and polymorphism decisions; the [primitives TDD](../../docs/designs/TDD-ui-platform-primitives-002-behavior-and-polymorphism.md) owns component design. A `Radix-Parity` comment in `src/utils/Slot.tsx` triggers provenance and license review before stable publication; the comment alone is not evidence of copied source.
