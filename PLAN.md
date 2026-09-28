# Execution plan

Status: working plan pending consolidated principal ratification. The composition-root CSS contract and review corrections are incorporated. This plan sequences work; it does not declare a P0 fix complete. Each item closes only when its evidence is reproducible in CI. The current copied packages remain an extracted baseline.

The [architecture source-of-truth index](docs/ARCHITECTURE_SOT.md) identifies the governing documents and the five new C3 TDDs. The older microfrontend documentation is read-only historical input.

## P0: establish and repair release evidence

| Order | Work                                                                                                                                                                                                                                                                                                                                                | Acceptance evidence                                                                                                                                                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Connect the central governance linter to this repository's `docs/02-designs` path and validate TDD metadata/structure.                                                                                                                                                                                                                              | CI validates these C3 drafts against GDC-011 and resolves cross-repository `SAD-003` references.                                                                                                                                                  |
| 1     | Keep the now-running `core-ui` Vitest suite reliable, add real design-system tests, replace its placeholder script, and find the root cause of declaration-build heap growth. A temporary `--max-old-space-size=4096` may support diagnosis but is not a fix or budget.                                                                             | Source CI runs interaction/state tests for both packages; declaration generation completes within a measured scenario budget with the cause and remediation recorded.                                                                             |
| 2     | Build an isolated consumer that installs tarballs from `npm pack`, without workspace aliases.                                                                                                                                                                                                                                                       | Consumer resolves documented JS, type, CSS, Sass, and asset paths. The harness is reused by later gates.                                                                                                                                          |
| 3     | Fix Sass token serialization for `low` and `focus` shadows, and invalid achromatic color output. Audit all `--ds-*` definitions and references.                                                                                                                                                                                                     | CSS parser and browser computed-value checks pass for every supported theme and representative property; unresolved variables are reported.                                                                                                       |
| 4     | Align Panda and Sass font token names/weights and ship a usable Inter `@font-face` contract with font assets/license.                                                                                                                                                                                                                               | Packed consumer loads the expected font and resolves all documented font variables.                                                                                                                                                               |
| 5     | Implement the agreed CSS delivery boundary: export aggregate component CSS plus explicit theme CSS; import them once at the host/standalone composition root; prohibit component-JS and remote duplicate injection. Verify no Panda callsite exists in `core-ui`, then remove `../core-ui/src` from Panda scanning.                                 | A clean producer build uses only owned styling sources; every documented subpath resolves; the packed consumer never runs Panda; Button is styled; a shell with multiple remotes has one intended stylesheet set and deterministic cascade order. |
| 6     | Repair Module Federation shared configuration for public package subpaths, React singleton identity, versions, and remote loading policy.                                                                                                                                                                                                           | Shell and remote share context identity and a single intended module instance; duplicate CSS behavior is known.                                                                                                                                   |
| 7     | Remove `new Function` and the single `window.__onThemeChange` callback; define provider subscription and theme scope.                                                                                                                                                                                                                               | Strict CSP consumer runs without `unsafe-eval`; two providers work in one DOM.                                                                                                                                                                    |
| 8     | Replace hook-name regex inference for `"use client"` with an explicit entry contract.                                                                                                                                                                                                                                                               | Packed Next App Router consumer imports a component that uses only `use(Context)` or `createContext` and behaves correctly.                                                                                                                       |
| 9     | Remove render-path debug logging; audit dead `rgb-token`, `_core-token-new`, `_token-resolver`, stale build logs, inherited documentation claims, package licensing, and accidental public files before release.                                                                                                                                    | Source check finds no debug log or unowned duplicate token path; removals, license notices, and public docs are reviewed for compatibility and provenance.                                                                                        |
| 10    | Repair documented primitive defects: TOC duplicate ID, unused `initialActiveId`, DOM prop leakage, nonfocusable navigation, CodeSelect keyboard/combobox semantics; test Disclosure registry timing. Audit `Slot.tsx` provenance and test the preferred `asChild` candidate for refs, typing, event order, semantic tags, and single-child failure. | Source interaction tests plus packed consumer a11y matrix pass. Suspected races are reproduced before a fix is claimed; polymorphism remains experimental until behavior and license evidence pass.                                               |

Items 1–2 establish trustworthy evidence. The later work can be parallelized by maintainers once the harness is stable, while package mutations stay scoped and reviewable. A green TypeScript check is useful but does not close any packed consumer item.

### P0 measurements gathered alongside repairs

- CSS and JS bytes for each documented import path and resulting consumer route, identifying raw, minified, gzip/Brotli, tool, and incremental consumer cost.
- `staticCss: ["*"]` generated-rule cost, Panda/Sass overlap, and style override behavior across cascade layers.
- Undefined or invalid `--ds-*` references by theme scope, including font and shadow variables.
- Build time, JS cost, layout work, and theme switch behavior in named consumer scenarios.
- A11y coverage by widget, state, theme, viewport, locale, and direction.

These measurements feed decisions in the [decision register](docs/architecture/DECISION_REGISTER.md); they are not preset arguments for removing an engine.

## P1: contract and governance

1. Obtain review of the canonical architecture draft and proposed authorizing ADRs. Before first production, edit accepted ADRs in place where necessary; approve major STD rule revisions through ADR authority.
2. Finalize package export map, styling ownership, theme scope, polymorphism, and React Aria scope with consumer examples. Native/simple primitives remain vendor-free; selected hooks for complex widgets must stay behind the public package API.
3. Publish a token schema and migration path toward DTCG 2025.10 compatible interchange if it provides practical value; do not describe the current Sass maps as already DTCG compliant.
4. Define support matrix, semantic versioning, deprecation window, Component Accessibility Conformance Report (Component ACR), and release record template. Reserve VPAT-based reporting for a complete product evaluation.

## P2: representative component proof

Implement and verify a small reference set: Button, a form control, an overlay, and a complex composite widget. Include keyboard, focus, visual states, high contrast/reduced motion where applicable, theme and font loading, and SSR/RSC consumers. Use one package candidate to validate the full release gate before expanding inventory.

## P3: global beta

Run real consumer pilots across standalone and federated applications. Validate multi-brand coexistence, localization and bidirectional layout, responsive reflow, touch targets, color contrast, performance budgets, migration cost, and support workflow. Publish known limitations and measured baselines.

## P4: stable release

Promote only when supported scenarios pass source, packed-package, integration, and product-page gates; governance decisions are accepted; provenance and rollback procedures exist; and at least one real consumer has completed a migration rehearsal. “Global” is a support and evidence commitment, not a package-version label.

## Review questions for the principals

1. Do the boundary and evidence model match the intended product contract?
2. Are P0 exit criteria sufficient before any public release?
3. Which open decisions need an ADR now, and which can wait for measured P0 data?
4. What consumer pilots and support matrix should define the first beta?
