# Scnehaux UI Platform

Standalone workspace for the UI Platform packages. This repository was split from the microfrontend workspace without modifying its source. It contains two physical packages:

| Package | Current responsibility |
| --- | --- |
| `@scnx/core-ui` | Style-agnostic React primitives and behavior |
| `@scnx/system` | Tier 1 core values, Tier 2 semantic tokens, themes, and styled components |

The three token tiers are a logical model. They are **not yet three physical packages**. Tier 3 component aliases live with the styled system. The package boundary and the dependency direction are described in [the working consensus](docs/architecture/WORKING_CONSENSUS.md).

## Status

This is an extracted baseline, **not a release candidate**. The copied packages retain known defects in CSS output, packaging, tests, theme behavior, and accessibility. The repository exists so those defects can be corrected and verified independently of the microfrontend project. See [PLAN.md](PLAN.md) and [ROADMAP.md](ROADMAP.md).

## Workspace

Requires pnpm 10.23.0 and a compatible Node.js version. From the repository root:

```sh
pnpm install
pnpm typecheck
pnpm build
pnpm test:source
```

`core-ui` Vitest currently runs (2 files, 10 tests); `design-system` still has a placeholder failing test script. The first baseline build completed `core-ui` and emitted `design-system` CSS/JS, then exhausted the default Node heap during declaration generation. See the [baseline record](docs/migration/BASELINE_VERIFICATION.md). Do not treat a successful package build or type check as release approval.

The package source was copied byte-for-byte. Build artifacts, dependencies, app shells, and local build logs were excluded. The [copy record](docs/migration/SOURCE_COPY.md) lists provenance and scope.

## Review status

The documents here record a **working consensus for principal review**. Decisions about React Aria adoption, multi-brand theme isolation, and the long-term styling engines remain open. No document in this repository claims that the copied code already meets the target contract.

The inherited implementation notes under `packages/**` are historical source material. Where they claim production readiness, absolute performance, or import paths inconsistent with the manifests, use this README, the working consensus, and the current package manifests as the review baseline. The provenance/license review for the `Slot` implementation is also a P0 publication check.
