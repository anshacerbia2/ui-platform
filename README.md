# Scnehaux UI Platform

Workspace for the `@scnx/core-ui` and `@scnx/system` packages.

## Document authority

There is one architecture authority: the
[Scnehaux Architecture repository](https://github.com/anshacerbia2/scnehaux-architecture).
Its GDC, EAD, PAD, SAD, ADR, STD, and Technology Radar records are the source
of truth according to each record's lifecycle status. A `draft` or `proposed`
record is authoritative evidence of a proposal, not an approved rule.

This repository keeps only the implementation documents needed next to the
code:

- [PLAN.md](PLAN.md) — ordered work and pass/fail acceptance;
- [ROADMAP.md](ROADMAP.md) — phase state and exit gates;
- [five TDDs](docs/designs/) — component-level implementation contracts;
- [principal review dispositions](docs/reviews/PRINCIPAL_REVIEW_DISPOSITIONS.md)
  — audit trail only, never normative authority.

Markdown beside package source is implementation commentary. It cannot
override the architecture repository, these TDDs, PLAN, or ROADMAP.

## Current state

The repository is an extracted, unreleased baseline with known build,
packaging, token, theme, accessibility, and test defects. It is not a release
candidate and does not claim implementation conformance.

The first executable gate is a deterministic clean installation:

```sh
pnpm install --frozen-lockfile
```

It must pass with lifecycle scripts enabled, without `--ignore-scripts`, and
without changing `pnpm-lock.yaml`. Until it passes locally and in CI, package
feature work remains blocked.

After bootstrap is repaired, use:

```sh
pnpm typecheck
pnpm build
pnpm test:source
```

## Packages

| Package         | Responsibility                                                        |
| --------------- | --------------------------------------------------------------------- |
| `@scnx/core-ui` | Style-agnostic React primitives and interaction behavior              |
| `@scnx/system`  | Tokens, themes, styled components, static CSS, fonts, and Sass assets |

The three token tiers are a logical model, not three physical packages. The
package boundary and dependency direction are specified by SAD-003 and the
local TDDs.
