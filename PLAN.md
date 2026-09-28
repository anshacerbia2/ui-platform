# UI Platform execution plan

Status: **active plan for an unreleased baseline**.

Normative architecture lives only in
[`anshacerbia2/scnehaux-architecture`](https://github.com/anshacerbia2/scnehaux-architecture).
This plan orders implementation work; it cannot approve an ADR, STD, SAD, or
release. The five [local TDDs](docs/designs/) own component-level design.

A row is complete only when its acceptance check runs in CI and passes. A
missing, skipped, or manually bypassed required check is a failure.

## Design readiness gate

Before package feature implementation begins, PAD-PLT-003 and SAD-003 must
resolve the capability and system boundaries, and all five TDDs must define
traceable requirements, exact contracts, algorithms, failure behavior,
observability, tests, rollout, compatibility, and bounded open questions. The
central linter and local documentation gate must pass, then the authorized human
reviewer must approve the proposed SAD/TDD revisions. CI or merge success alone
does not perform that lifecycle transition.

## P0 entry gate — deterministic bootstrap

Repair the design-system Panda prepare resolution before package feature work.
A clean checkout must complete `pnpm install --frozen-lockfile` with lifecycle
scripts enabled, without `--ignore-scripts`, without changing `pnpm-lock.yaml`,
and without an unresolved `@pandacss/dev` invocation. Documentation, this
repair, and CI harness work may proceed while the gate is red; package feature
work may not.

## P0 — release-blocking repair and evidence

| Order | Owner            | Work                                                                                                                                                                                                                                                   | Pass/fail acceptance                                                                                                                                                                                                                                              |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Repository Lead  | Add the clean-install gate to CI and make every implemented P0 gate required on pull requests and `main`.                                                                                                                                              | A clean checkout installs with the pinned pnpm version, scripts enabled, unchanged lockfile, and no bypass flag; every implemented required job runs and passes.                                                                                                  |
| 1     | Governance Lead  | Run the central architecture linter from `scnehaux-architecture@main` against `docs/designs/`; run the local document contract check.                                                                                                                  | Exactly five TDDs are discovered; all resolve SAD-003 and pass with zero failures; no local schema fork or relaxed rule exists; all local governing links resolve.                                                                                                |
| 2     | Test Lead        | Run real source tests for both packages with Vitest `retry: 0`; remove the design-system placeholder; fix declaration-build heap growth.                                                                                                               | Both suites pass with `retry: 0`; declaration generation completes on the pinned CI runner and Node version with the default heap; peak memory is recorded and a heap override fails the policy check.                                                            |
| 3     | Release Lead     | Implement [TDD packaging](docs/designs/TDD-ui-platform-packaging-001-build-and-package-contract.md): build, `pnpm pack`, explicit exports, React peer alignment, token/CSS/Sass/font assets, licenses, and consumers outside the workspace.            | Both tarballs install without workspace aliases; no wildcard export or `workspace:` range remains; every declared JS, type, CSS, Sass, token, and font subpath resolves at both supported React peer-range boundaries.                                            |
| 4     | Token Lead       | Implement [TDD tokens](docs/designs/TDD-ui-platform-tokens-003-theme-and-token-output.md): repair invalid values, canonical names, equal public key sets, font assets, contrast, and Sass/Panda parity.                                                | The token gate reports zero grammar, reference, property-value, key-set, font-resolution, or WCAG 2.2 SC 1.4.3/1.4.11 failures for every supported theme and state.                                                                                               |
| 5     | Styling Lead     | Implement [TDD CSS delivery](docs/designs/TDD-ui-platform-styled-004-component-css-delivery.md): aggregate component CSS, explicit theme CSS, scoped roots/resets, deterministic layers, and visible forced-colors focus outlines.                     | Packed consumers render the supported set with no undeclared CSS side effects or host leakage; all UI Platform rules use declared layers; forced-colors tests find a visible `:focus-visible` outline on every supported focusable component.                     |
| 6     | Theme Lead       | Implement [TDD theme/provider](docs/designs/TDD-ui-platform-theme-005-provider-and-transitions.md): remove `new Function` and global callbacks; add scoped providers, portal roots, SSR-safe initialization, cleanup, and bounded transition fallback. | Standalone SSR/hydration, two-provider isolation, portal inheritance, reduced motion, interruption, unmount cleanup, and strict-CSP tests all pass with zero violations or leaked subscriptions.                                                                  |
| 7     | Interaction Lead | Implement [TDD primitives](docs/designs/TDD-ui-platform-primitives-002-behavior-and-polymorphism.md): native semantics, composite-widget patterns, controlled state, focus, IDs, prop filtering, registry races, and bounded polymorphism.             | Source and packed behavior matrices pass for required keys, focus order/restoration, state/ARIA, names, ref targets, event order, cleanup, router composition, and invalid-child diagnostics; the reproduced registry race is closed.                             |
| 8     | Packaging Lead   | Replace hook-name inference with explicit server-safe and client entry contracts; test Next App Router build, SSR, hydration, and interaction from packed tarballs.                                                                                    | The consumer imports each supported server/client entry without ignored directive warnings, environment leakage, hydration mismatch, or missing type/export resolution.                                                                                           |
| 9     | Integration Lead | Evaluate the conditional federation contract using packed host, `remote-a`, and `remote-b`. Module Federation remains `assess`; this fixture does not authorize adoption.                                                                              | Both load orders preserve one React/context identity and one CSS/theme asset instance; an incompatible remote fails in a controlled route-local way; the rest of the host remains usable and records one versioned telemetry event.                               |
| 10    | Security Lead    | Run dependency, SBOM/provenance, license, side-effect, and strict-CSP gates. Propagate consumer-controlled nonces or hashes through any evaluated federation runtime and dynamic chunks.                                                               | High/critical applicable advisories block; every dependency/copied source has a license; public-entry import causes no DOM/global/network/style mutation; standalone and federation fixtures record zero CSP violations without `unsafe-eval` or `unsafe-inline`. |
| 11    | Release Lead     | Produce the P0 evidence packet and perform the exit review against exact commits and artifact checksums.                                                                                                                                               | Every applicable row above has a current CI link and immutable artifact evidence; failed capabilities remain absent from stable exports; architecture statuses are reported exactly as stored in the architecture repository.                                     |

## Measurement rules

Measurements inform decisions; they do not become universal policy by being
written in a report. Every comparison records the exact import, scenario,
consumer baseline, runner/device, tool version, raw/minified/gzip/Brotli bytes,
parse/evaluation cost, build time, and relevant interaction trace. There is no
universal 15 KB, 10%, or 2x threshold.

If both alternatives satisfy correctness, accessibility, security, license,
and approved consumer budgets, the TDD's preferred option is retained. If only
one qualifies, use it. If neither qualifies, keep the capability outside stable
exports and reopen the design.

## Later work

- **P1 — release contract:** support matrix, semantic-versioning policy,
  deprecation window, Component ACRs, migration rehearsal, provenance, and
  rollback record.
- **P2 — representative slice:** Button, one form control, one overlay, and one
  composite widget through all applicable gates.
- **P3 — beta pilots:** named standalone and, only if separately authorized,
  federated consumers covering localization, bidirectional layout, multi-brand
  isolation, responsive reflow, touch targets, budgets, migration, and support.
- **P4 — stable:** exact-version approval, release evidence, and at least one
  real consumer migration and rollback rehearsal.
