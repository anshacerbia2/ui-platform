---
doc_meta:
  id: TDD-ui-platform-packaging-001
  title: Build and Published Package Contract
  owner: UI Platform Team
  version: 0.2.0
  status: proposed
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-09-29
---

# TDD-ui-platform-packaging-001: Build and Published Package Contract

## Purpose

Specify how the two workspace packages become independently installable artifacts. The existing source build is a baseline, not publication evidence.

## Scope

`@scnx/core-ui` JavaScript and types; `@scnx/system` JavaScript, types, theme/component CSS, Sass source exports, and fonts; SSR/RSC and federation consumer fixtures. Registry publication and release automation follow only after these gates pass.

## Technical Context

The repo uses pnpm workspaces, tsup, Sass, and Panda. A clean install currently fails when the design-system `prepare` script cannot resolve `@pandacss/dev`; `--ignore-scripts` is not an acceptable baseline. `core-ui` built in the first standalone run. `system` emitted CSS and JS but its declaration process exhausted the default Node heap. Some bundled outputs warned that `"use client"` directives were ignored. Its test script is still a placeholder. These are observed failures to repair, not characteristics of the target design.

## Component Design

The build pipeline has four stages: generate token/recipe assets in the producer workspace; build both packages in dependency order; pack each package with the pinned pnpm version; install tarballs into consumers outside the workspace. No release check may substitute a workspace alias for a packed import. The packed consumer does not run Panda or inspect workspace source.

Every supported import path is listed in a machine-readable export inventory derived from `package.json`. The inventory identifies JS, declarations, CSS, fonts, and Sass paths. The composition-root CSS contract is defined in [TDD styled components](TDD-ui-platform-styled-004-component-css-delivery.md). Exact-commit evidence plus the lifecycle authority recorded in `scnehaux-architecture` are required before stable publication.

## Data Model

Release record: source commit, package name/version, tarball checksum, declared export path, resolved file, consumer scenario, expected result, actual result, and CI link. Build products are immutable outputs; generated `src/styled-system` is not hand-edited.

## API / Interface

Public API is `package.json#exports` plus documented aggregate component CSS, theme CSS, Sass asset entries, and stable `@scnx/system/tokens/*` entries. React and React DOM are peers. Component JS has no implicit CSS side effect. The package must not depend on a consumer's source-path alias or on a consumer running Panda merely to render shipped components.

## Algorithms / Logic

1. From a clean checkout, run `pnpm install --frozen-lockfile` with lifecycle scripts enabled and require an unchanged lockfile.
2. Verify `core-ui` has no Panda callsite, generate styling assets from sources owned by `system`, then build `core-ui` and `system` in dependency order.
3. Execute `pnpm pack` for each package and fail if a packed manifest retains a `workspace:` dependency.
4. Install the tarballs in `fixtures/consumers/packed` with declared peer versions and no workspace alias.
5. Import every documented subpath and fail on missing JS, type, CSS, or asset targets.
6. At the standalone or host composition root, import aggregate component CSS and the selected theme CSS once.
7. Render the supported set; run `fixtures/consumers/next-app` and `fixtures/consumers/csp`; then evaluate `fixtures/federation/host` with `remote-a` and `remote-b`. Remotes must not inject UI Platform CSS.

Client-only entry boundaries are explicit in source and verified in the emitted ESM. A hook-name regex is not the authority for `"use client"`.

## Configuration

Pin the package manager and toolchain in the workspace. Record supported Node, React, bundler, and browser versions in the release record. Public exports are explicit; no wildcard subpath is published. `@scnx/system` declares `@scnx/core-ui` as a peer and dev dependency, and both packages declare identical `react` and `react-dom` peer ranges.

Module Federation remains `assess`. The federation fixture evaluates the contract and does not authorize product adoption. If an owning SAD and accepted decision separately authorize federation, its host follows ADR-GLB-FE-012: explicit singleton keys for React, React DOM, `@scnx/core-ui`, and every public context-bearing entry generated from the export inventory; `requiredVersion` is the consuming application's declared range; remotes remain lazy; only the host may load eagerly. ADR-GLB-FE-011 constrains an authorized federation to an Rspack-based toolchain; it does not itself authorize federation.

## Testing Strategy

Source tests cover state and interaction; producer tests cover Panda generation and package builds; packed tests cover exports and emitted assets. Next App Router imports client-only and server-safe entries. Both remote load orders must produce one React identity, one UI context identity, exactly one aggregate component stylesheet content hash, one instance of each selected theme asset, and scoped portal styling. The evaluated federation runtime must propagate consumer-controlled nonces or hashes to remote entries and dynamic chunks under the same strict policy as the standalone fixture. Any unresolved export, retained `workspace:` range, duplicate stylesheet, CSP violation, incompatible-version mismatch without a controlled failure, or required fixture failure fails CI.

## Performance Notes

Measure declaration-build peak memory and time, CSS bytes by import path, and incremental consumer JS size. Record raw, minified, gzip/Brotli, tool, and scenario before assigning a threshold. No universal package-size budget is assumed.

## Security Notes

The packed consumer runs under a CSP whose `script-src` and `style-src` reject `unsafe-eval` and `unsafe-inline`. Bootstrap, remote entry, and dynamic chunk execution use a consumer-controlled nonce or hash; failure blocks the evaluated capability rather than weakening CSP. An import-only test proves that importing any public entry mutates no DOM, global, network, or stylesheet state, and that no asset needed at render time is dropped by a bundler honoring `sideEffects`. The dependency audit required by STD-GLB-FE-006 runs against the resolved lockfile or SBOM on every fixture, including framework and `react-server-dom-*` advisories. Release provenance and license review accompany publication.

## Operational Notes

On failure, retain the previous immutable release and publish a corrected version; do not mutate a previously published tarball. A failing federation evaluation keeps federation outside the supported product scope and does not block standalone package repair.

## Traceability

Architecture authority: SAD-003; ADR-GLB-FE-010, ADR-GLB-FE-011, ADR-GLB-FE-012, ADR-GLB-FE-013, and ADR-UIP-PLT-001; STD-GLB-FE-002, STD-GLB-FE-006, STD-GLB-FE-007, and STD-UIP-ENG-001. Each record's lifecycle status in `scnehaux-architecture` controls whether it is binding or proposed. Execution: [PLAN](../../PLAN.md) P0 rows 0–3 and 8–10.
