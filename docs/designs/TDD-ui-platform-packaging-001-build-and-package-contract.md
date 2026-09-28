---
doc_meta:
  id: TDD-ui-platform-packaging-001
  title: Build and Published Package Contract
  owner: UI Platform Team
  version: 0.1.0
  status: draft
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-28
---

# TDD-ui-platform-packaging-001: Build and Published Package Contract

## Purpose

Specify how the two workspace packages become independently installable artifacts. The existing source build is a baseline, not publication evidence.

## Scope

`@scnx/core-ui` JavaScript and types; `@scnx/system` JavaScript, types, theme/component CSS, Sass source exports, and fonts; SSR/RSC and federation consumer fixtures. Registry publication and release automation follow only after these gates pass.

## Technical Context

The repo uses pnpm workspaces, tsup, Sass, and Panda. `core-ui` built in the first standalone run. `system` emitted CSS and JS but its declaration process exhausted the default Node heap. Some bundled outputs warned that `"use client"` directives were ignored. Its test script is still a placeholder. These are observed failures to repair, not characteristics of the target design.

## Component Design

The build pipeline has four stages: generate token/recipe assets in the producer workspace; build both packages in dependency order; pack each package with the pinned pnpm version; install tarballs into consumers outside the workspace. No release check may substitute a workspace alias for a packed import. The packed consumer does not run Panda or inspect workspace source.

Every supported import path is listed in a machine-readable export inventory derived from `package.json`. The inventory identifies JS, declarations, CSS, fonts, and Sass paths. The composition-root CSS working contract is defined in [TDD styled components](TDD-ui-platform-styled-004-component-css-delivery.md); packed/federated evidence and formal ratification close it before stable publication.

## Data Model

Release record: source commit, package name/version, tarball checksum, declared export path, resolved file, consumer scenario, expected result, actual result, and CI link. Build products are immutable outputs; generated `src/styled-system` is not hand-edited.

## API / Interface

Public API is `package.json#exports` plus documented aggregate component CSS, theme CSS, Sass asset entries, and stable `@scnx/system/tokens/*` entries. React and React DOM are peers. Component JS has no implicit CSS side effect. The package must not depend on a consumer's source-path alias or on a consumer running Panda merely to render shipped components.

## Algorithms / Logic

1. Verify `core-ui` has no Panda callsite, generate styling assets from sources owned by `system`, then build `core-ui` and `system` in dependency order.
2. Execute `pnpm pack` for each package and fail if a packed manifest retains a `workspace:` dependency.
3. Install the tarballs in `fixtures/consumers/packed` with declared peer versions and no workspace alias.
4. Import every documented subpath and fail on missing JS, type, CSS, or asset targets.
5. At the standalone or host composition root, import aggregate component CSS and the selected theme CSS once.
6. Render representative components; run `fixtures/consumers/next-app` and `fixtures/consumers/csp`; then run `fixtures/federation/host` with `remote-a` and `remote-b`. Remotes must not inject UI Platform CSS.

Client-only entry boundaries are explicit in source and verified in the emitted ESM. A hook-name regex is not the authority for `"use client"`.

## Configuration

Pin the package manager and toolchain in the workspace. Record supported Node, React, bundler, and browser versions in the release record. The federation host owns explicit singleton keys for React, React DOM, and every supported public context-bearing UI request. `requiredVersion` is derived from the relevant manifest range. Remotes remain lazy; only the host may choose eager loading.

## Testing Strategy

Source tests cover state and interaction; producer tests cover Panda generation and package builds; packed tests cover exports and emitted assets. Next App Router imports client-only and server-safe entries. Both remote load orders must produce one React identity, one UI context identity, exactly one aggregate component stylesheet content hash, exactly one selected theme asset, and scoped portal styling. Any unresolved export, retained `workspace:` range, duplicate stylesheet, incompatible-version mismatch without a controlled failure, or required fixture failure fails CI.

## Performance Notes

Measure declaration-build peak memory and time, CSS bytes by import path, and incremental consumer JS size. Record raw, minified, gzip/Brotli, tool, and scenario before assigning a threshold. No universal package-size budget is assumed.

## Security Notes

The packed consumer runs under CSP without `unsafe-eval`. Release provenance and dependency/license review accompany publication.

## Operational Notes

On failure, retain the previous immutable release and publish a corrected version; do not mutate a previously published tarball.

## Traceability

Parent: SAD-003. Governing review drafts: STD-UIP-ENG-001 and STD-GLB-FE-002. Implements UIP-DEC-005, UIP-DEC-006, and UIP-DEC-007 plus P0 items 1, 2, 5, 6, and 8 in [PLAN](../../PLAN.md).
