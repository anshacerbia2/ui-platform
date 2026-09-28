# UI Platform execution plan

Status: **working plan pending consolidated principal ratification**.

**P0** means the pre-release blocking remediation milestone. It establishes trustworthy source, package, and integration evidence before any public beta. A task closes only when its acceptance evidence runs in CI.

The [architecture SOT](docs/ARCHITECTURE_SOT.md), [seven-item decision register](docs/architecture/DECISION_REGISTER.md), and five [C3 designs](docs/designs/) define the governing context.

## P0: release-blocking evidence and repair

| Order | Owner                  | Work                                                                                                                                                                                                                                             | Pass/fail acceptance                                                                                                                                                                                            |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Governance maintainer  | Invoke the pinned central governance linter against `docs/designs/` and resolve `SAD-003` through the central registry. Keep the central schema intact.                                                                                          | All five TDDs are discovered and validated; no local linter fork or relaxed directory rule exists.                                                                                                              |
| 1     | Test maintainer        | Keep Core UI tests running, replace the design-system placeholder test, and diagnose declaration-build heap growth.                                                                                                                              | Both package suites execute in CI. Declaration generation completes within a recorded machine/tool scenario. A heap override may collect diagnostics and cannot close the task.                                 |
| 2     | Release maintainer     | Build both packages and create tarballs with `pnpm pack`. Install them in `fixtures/consumers/packed` without workspace aliases.                                                                                                                 | Packed manifests contain publishable versions instead of `workspace:*`; every documented JS, type, CSS, Sass, font, and token subpath resolves.                                                                 |
| 3     | Token maintainer       | Fix `low` and `focus` shadow serialization, invalid achromatic output, and the `--ds-shadow-lg`/`--ds-shadow-low` mismatch. Audit every public variable definition and reference.                                                                | A CSS parser accepts emitted declarations; browser computed-property tests pass after substitution; every unresolved public `var(--ds-*)` or invalid property value fails CI.                                   |
| 4     | Token maintainer       | Generate aligned Sass/Panda font tokens and ship Inter font files, declarations, and license.                                                                                                                                                    | The packed consumer loads the declared face and resolves every public font variable; missing font assets fail CI.                                                                                               |
| 5     | Styling maintainer     | Publish one aggregate component stylesheet and explicit theme stylesheets. Import them once in composition roots. Put Sass components and Panda recipes in their named layers. Verify Core UI has no Panda callsites, then remove its scan path. | The packed consumer renders the supported component set. No component JS or remote imports CSS. Producer scanning covers owned sources only.                                                                    |
| 6     | Integration maintainer | Implement UIP-DEC-007 in `fixtures/federation/host`, `remote-a`, and `remote-b` using packed tarballs.                                                                                                                                           | Both remote load orders yield one React identity, one context identity, exactly one component stylesheet content hash, one selected theme asset, and a controlled failure for an incompatible required version. |
| 7     | Theme maintainer       | Remove unsafe evaluation and the singleton global callback. Implement `[data-scnx-theme]` roots and explicit portal containers.                                                                                                                  | `fixtures/consumers/csp` passes without `unsafe-eval`; two roots retain distinct computed themes; portals retain the originating root; listeners clean up.                                                      |
| 8     | Packaging maintainer   | Replace hook-name regex inference with explicit server-safe and client entry contracts.                                                                                                                                                          | `fixtures/consumers/next-app` imports an entry using only `use(Context)` or `createContext` and passes build, SSR, hydration, and interaction checks.                                                           |
| 9     | Repository maintainer  | Remove render logging, dead token paths, stale build logs, accidental public files, and unowned copied claims. Complete package provenance and license inventory.                                                                                | CI grep and package-content snapshots pass; compatibility and license impact are reviewed.                                                                                                                      |
| 10    | Interaction maintainer | Fix TOC duplicate IDs, unused `initialActiveId`, DOM prop leakage, non-focusable navigation, CodeSelect semantics, and the Disclosure registry race if reproduced.                                                                               | Component behavior matrices pass source and packed-consumer tests. Required keyboard, focus, state, and accessible-name behavior is complete.                                                                   |
| 11    | API maintainer         | Implement UIP-DEC-001 and UIP-DEC-004 evidence: Combobox comparison, React Aria boundary, Slot provenance, and polymorphism contract.                                                                                                            | APG checks, manual NVDA and VoiceOver records, bundle comparison, ref/type/event tests, router Link example, and license review pass. Unsupported widgets remain outside stable exports.                        |

Items 0–2 establish the evidence foundation. Package mutations begin after the relevant harness exists.

## P0 measurements

- CSS and JavaScript size per documented import using raw, minified, gzip, Brotli, and parsed representations.
- Incremental consumer cost, tool version, environment, and baseline for every budget.
- Panda `staticCss: ["*"]` cost, Sass/Panda overlap, cascade conflicts, and producer build time.
- Undefined or invalid public variables by theme, including shadow and font values.
- Named interaction traces for layout work and theme transitions.
- Accessibility coverage by widget, state, theme, viewport, locale, direction, NVDA, and VoiceOver.

## P0 decision exit review

By 2026-10-23, review UIP-DEC-001 through UIP-DEC-007 against their evidence. Accepted decisions are recorded in the authorizing ADR before status promotion. A failed evidence gate keeps the related API or capability outside stable exports.

## P1: contract and release governance

1. Align `@scnx/core-ui` and `@scnx/system` on a tested React peer range and include React 18 and React 19 consumers where support is claimed.
2. Publish `@scnx/system/tokens/*` subpaths and the canonical token naming contract.
3. Add a `transitionend` timeout/cancellation fallback and interruption tests.
4. Define anchor-backed Button behavior, including `role="button"` only when native link semantics are absent and `aria-haspopup` when the trigger contract requires it.
5. Move APCA generation into the producer pipeline as research evidence while WCAG 2.2 SC 1.4.3 and 1.4.11 remain release targets.
6. Resolve duplicate heading values across 4xl–7xl or document their semantic distinction.
7. Include font files and licenses in the packed `files` contract.
8. Publish the support matrix, semantic-versioning policy, deprecation window, Component ACR, migration guide, and release record.

DTCG 2025.10 is a Community Group Final Report and a target interchange format. The current Sass maps remain the source until a generator and migration test establish a replacement.

## P2: representative slice

Verify Button, one form control, one overlay, and one composite widget through source, packed, SSR/RSC, CSP, federation, visual, and Component ACR gates.

## P3: global beta

Run named standalone and federated pilots covering multi-brand coexistence, localization, bidirectional layout, responsive reflow, touch targets, contrast, measured budgets, migration cost, and support workflow.

## P4: stable release

Promote after governance ratification, provenance review, rollback rehearsal, and at least one real consumer migration rehearsal.
