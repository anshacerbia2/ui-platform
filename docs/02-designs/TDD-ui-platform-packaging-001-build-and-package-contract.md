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

The build pipeline has four stages: generate token/recipe assets; build both packages in dependency order; pack each package; install tarballs into consumers outside the workspace. No release check may substitute a workspace alias for a packed import.

Every supported import path is listed in a machine-readable export inventory derived from `package.json`. The inventory identifies JS, declarations, CSS, fonts, and Sass paths. The CSS delivery choice is closed in [TDD styled components](TDD-ui-platform-styled-004-component-css-delivery.md) before stable publication.

## Data Model

Release record: source commit, package name/version, tarball checksum, declared export path, resolved file, consumer scenario, expected result, actual result, and CI link. Build products are immutable outputs; generated `src/styled-system` is not hand-edited.

## API / Interface

Public API is `package.json#exports` plus documented CSS/Sass asset entry points. React and React DOM are peers. The package must not depend on a consumer's source-path alias or on a consumer running Panda merely to render shipped components.

## Algorithms / Logic

1. Build `core-ui`, then `system`.
2. Execute `npm pack` for each package.
3. Create isolated consumers from those tarballs and declared peer versions.
4. Import every documented subpath and fail on missing JS, type, CSS, or asset targets.
5. Render representative components; then run SSR/RSC, strict CSP, and shell/remote fixtures.

Client-only entry boundaries are explicit in source and verified in the emitted ESM. A hook-name regex is not the authority for `"use client"`.

## Configuration

Pin the package manager and toolchain in the workspace. Record supported Node, React, bundler, and browser versions in the release record. Version compatibility for Module Federation uses explicit share keys for root and public context-bearing subpaths, with a tested `requiredVersion` policy; remotes are not made eager by default.

## Testing Strategy

Source tests cover state and interaction; packed tests cover exports and emitted assets. Next App Router imports client-only and server-safe entries. A federated shell and remote verify React/context identity and CSS loading. CI fails when a documented path is unresolved or a fixture fails.

## Performance Notes

Measure declaration-build peak memory and time, CSS bytes by import path, and incremental consumer JS size. No universal 12 KB package budget is assumed.

## Security Notes

The packed consumer runs under CSP without `unsafe-eval`. Release provenance and dependency/license review accompany publication.

## Operational Notes

On failure, retain the previous immutable release and publish a corrected version; do not mutate a previously published tarball.

## Traceability

Parent: SAD-003. Governing review drafts: STD-UIP-ENG-001 and STD-GLB-FE-002. P0 items 1, 2, 5, 6, and 8 in [PLAN](../../PLAN.md). This replaces the UI Platform direction formerly described by the read-only microfrontend TDD-SCNX-UI-JS-001.
