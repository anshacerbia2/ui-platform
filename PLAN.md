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

## Role accountability

Execution roles are stable responsibilities, not person names. They map to the
team ownership in PAD-PLT-003 section 7.1 as follows; the exact ratification and
release records name the individual acting in each role.

| Execution role   | Accountable team | Consultation or approval boundary                                             |
| :--------------- | :--------------- | :---------------------------------------------------------------------------- |
| Repository Lead  | UI Platform Team | Developer Platform for protected CI and repository controls                   |
| Governance Lead  | UI Platform Team | Architecture Authority owns human lifecycle transitions                       |
| Test Lead        | UI Platform Team | Accessibility reviewer for assistive-technology evidence                      |
| Release Lead     | UI Platform Team | Developer Platform supplies registry, provenance, and signing infrastructure  |
| Token Lead       | UI Platform Team | Design and accessibility owners review semantics and contrast evidence        |
| Styling Lead     | UI Platform Team | Token Lead and consuming Product teams review public styling compatibility    |
| Theme Lead       | UI Platform Team | Consuming Product teams review SSR, preference, and multi-brand behavior      |
| Interaction Lead | UI Platform Team | Accessibility reviewer and consumers review behavior contracts                |
| Packaging Lead   | UI Platform Team | Developer Platform reviews package and registry mechanics                     |
| Integration Lead | UI Platform Team | Workspace Experience and named Product consumers review composition scenarios |
| Security Lead    | UI Platform Team | Architecture Authority decides any requested security-policy waiver           |

## P0 entry gate — deterministic bootstrap

Repair the design-system Panda prepare resolution before package feature work.
A clean checkout must complete `pnpm install --frozen-lockfile` with lifecycle
scripts enabled, without `--ignore-scripts`, without changing `pnpm-lock.yaml`,
and without an unresolved `@pandacss/dev` invocation. Documentation, this
repair, and CI harness work may proceed while the gate is red; package feature
work may not.

## P0 — release-blocking repair and evidence

| Order | Owner            | Work                                                                                                                                                                                                                                                   | Pass/fail acceptance                                                                                                                                                                                                                                                                                                |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Repository Lead  | Add the clean-install gate to CI and make every implemented P0 gate required on pull requests and `main`.                                                                                                                                              | A clean checkout installs with the pinned pnpm version, scripts enabled, unchanged lockfile, and no bypass flag; every implemented required job runs and passes.                                                                                                                                                    |
| 1     | Governance Lead  | Run the central architecture linter from `scnehaux-architecture@main` against `docs/designs/`; run the local document contract check.                                                                                                                  | Exactly five TDDs are discovered; all resolve SAD-003 and pass with zero failures; no local schema fork or relaxed rule exists; all local governing links resolve.                                                                                                                                                  |
| 2     | Test Lead        | Run real source tests for both packages with Vitest `retry: 0`; remove the design-system placeholder; fix declaration-build heap growth.                                                                                                               | Both suites pass with `retry: 0`; declaration generation completes on the pinned CI runner and Node version with the default heap; peak memory is recorded and a heap override fails the policy check.                                                                                                              |
| 3     | Release Lead     | Implement [TDD packaging](docs/designs/TDD-ui-platform-packaging-001-build-and-package-contract.md): build, `pnpm pack`, explicit exports, React peer alignment, token/CSS/Sass/font assets, licenses, and consumers outside the workspace.            | Both tarballs install without workspace aliases; no wildcard export or `workspace:` range remains; every declared JS, type, CSS, Sass, token, and font subpath resolves at both supported React peer-range boundaries.                                                                                              |
| 4     | Token Lead       | Implement [TDD tokens](docs/designs/TDD-ui-platform-tokens-003-theme-and-token-output.md): repair invalid values, canonical names, equal public key sets, font assets, contrast, and Sass/Panda parity.                                                | The token gate reports zero grammar, reference, property-value, key-set, font-resolution, or WCAG 2.2 SC 1.4.3/1.4.11 failures for every supported theme and state.                                                                                                                                                 |
| 5     | Styling Lead     | Implement [TDD CSS delivery](docs/designs/TDD-ui-platform-styled-004-component-css-delivery.md): aggregate component CSS, explicit theme CSS, scoped roots/resets, deterministic layers, and visible forced-colors focus outlines.                     | Packed consumers render the supported set with no undeclared CSS side effects or host leakage; all UI Platform rules use declared layers; forced-colors tests find a visible `:focus-visible` outline on every supported focusable component.                                                                       |
| 6     | Theme Lead       | Implement [TDD theme/provider](docs/designs/TDD-ui-platform-theme-005-provider-and-transitions.md): remove `new Function` and global callbacks; add scoped providers, portal roots, SSR-safe initialization, cleanup, and bounded transition fallback. | Standalone SSR/hydration, two-provider isolation, portal inheritance, reduced motion, interruption, unmount cleanup, and strict-CSP tests all pass with zero violations or leaked subscriptions.                                                                                                                    |
| 7     | Interaction Lead | Implement [TDD primitives](docs/designs/TDD-ui-platform-primitives-002-behavior-and-polymorphism.md): native semantics, composite-widget patterns, controlled state, focus, IDs, prop filtering, registry races, and bounded polymorphism.             | Source and packed behavior matrices pass for required keys, focus order/restoration, state/ARIA, names, ref targets, event order, cleanup, router composition, and invalid-child diagnostics; the reproduced registry race is closed.                                                                               |
| 8     | Packaging Lead   | Replace hook-name inference with explicit server-safe and client entry contracts; test Next App Router build, SSR, hydration, and interaction from packed tarballs.                                                                                    | The consumer imports each supported server/client entry without ignored directive warnings, environment leakage, hydration mismatch, or missing type/export resolution.                                                                                                                                             |
| 9     | Integration Lead | Evaluate the conditional federation contract using packed host, `remote-a`, and `remote-b`. Module Federation remains `assess`; this fixture does not authorize adoption.                                                                              | Both load orders preserve one React/context identity and one CSS/theme asset instance; an incompatible remote fails in a controlled route-local way; the rest of the host remains usable and records one versioned telemetry event.                                                                                 |
| 10    | Security Lead    | Run dependency, SBOM/provenance, license, side-effect, and strict-CSP gates. Propagate consumer-controlled nonces or hashes through any evaluated federation runtime and dynamic chunks.                                                               | High/critical applicable advisories block; every dependency/copied source has a license; public-entry import causes no DOM/global/network/style mutation; standalone and federation fixtures record zero CSP violations without `unsafe-eval` or `unsafe-inline`.                                                   |
| 11    | Release Lead     | Produce the P0 evidence packet and perform the exit review against exact commits and artifact checksums ([TDD packaging](docs/designs/TDD-ui-platform-packaging-001-build-and-package-contract.md) R1–R6).                                             | Every applicable row above has its CI result and immutable artifact evidence in an attested packet committed to the repository (a CI link alone expires after 90 days); failed capabilities remain absent from stable exports; architecture statuses are reported exactly as stored in the architecture repository. |

## Component workshop

Proposed in ADR-UIP-WKS-001; this work does not change the P0 rows above. W2
becomes a required check once the `CHROMATIC_PROJECT_TOKEN` secret exists.

| Order | Owner        | Work                                                                                                                                                                                                                                   | Pass/fail acceptance                                                                                                                                                                                                          |
| ----- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1    | Styling Lead | Add Storybook 10 (react-vite) at the workspace root with stories for every supported component; preview the built CSS assets inside ThemeProvider with theme and mode controls; run every story through the Vitest addon and axe-core. | `pnpm test:stories` runs every story in Chromium with zero failures and zero `error`-level axe violations; the static build uploads as a CI artifact; the packed-artifact inspector finds no workshop file in either tarball. |
| W2    | Release Lead | Run Chromatic on every push against the static Storybook build with `exitZeroOnChanges: false`.                                                                                                                                        | Every story has an approved Chromatic baseline; a pull request with an unreviewed visual change fails the visual-review check.                                                                                                |

## Spatial identity adoption

Implements ADR-UIP-VIS-001 and STD-UIP-TKN-001 2.4.0, with 2.5.0's `control` spacing (TDD tokens SI6). The visual target is the
design reference repository
[`anshacerbia2/scnehaux-design`](https://github.com/anshacerbia2/scnehaux-design)
(ADR-UIP-VIS-002; site: <https://anshacerbia2.github.io/scnehaux-design/>):
`design-system/components/<Name>/README.md` states each component's usage and
its delta from the current build, and `preview.html` its target markup. The
reference is non-normative: a component's specification governs, and values
come only from the token source, from which the reference is regenerated. These
rows do not change the P0 rows above.

| Order | Owner            | Work | Pass/fail acceptance |
| ----- | ---------------- | ---- | -------------------- |
| I1    | Token Lead       | Emit the radius ladder (`mark`, `element`, `control`, `container`, `panel`, `pill`) and `effect.material.*` in every theme (TDD tokens SI1–SI5). Merged in #110 (`2c80908`). | The token gate reports zero findings with `STANDARD` at 2.4.0; radius strictly ascends and the material set is equal in every theme and mode; the CSS contract change is additive. |
| I2    | Styling Lead     | Move every existing styled component whose card lists a "Delta from the current build" to the identity through its specification, for example Button primary to ink and secondary to the `raised` material, with `ghost`, `danger`, and `size` (revising TDD styled BR1); IconButton, Badge, Code, Alert, and TextField radii on the ladder; Accordion, Dialog, Tabs, Navbar, Sidebar, CodeShowcase, FloatingLayout, and the CodeSelect listbox on their materials. Control and row heights stay component geometry in each specification, not tokens (ADR-UIP-VIS-001 item 6). | No container declares its own border, radius, and shadow; each `*.spec.json` binds its material and radius tokens; component contrast pairs pass in every theme and mode; each Chromatic change is reviewed and accepted per component. |
| I3    | Styling Lead     | Add `Surface`, the styled entry for the on-page materials (`flat`, `raised`, `panel`, `well`), born with its specification (card `components/Surface/`). | Specification conformance, stories, axe-core, and packed-consumer checks pass; floating materials stay with their overlay components. |
| I4    | Integration Lead | ui-platform-docs replaces its Sass radius literals (`$radius-card`, `$radius-panel`, `$radius-inner`) with the radius tokens and draws its cards with materials. | No radius or shadow literal remains in the site's styles; the site pins the package release that contains I1. |
| I5    | Token Lead       | Rebuild the Figma plugin on I1 (412 × 4 color and 33 × 2 dimension variables, 16 text styles, 30 effect styles) and decide the mode limit: a plan with modes (all four color modes in one collection) or one chosen mode per file on Starter (TDD tokens FG11). Phase 2 adds component sets. | A rerun on the file updates in place with zero errors; the report lists exactly the modes the plan refuses. |
| I6    | Token Lead       | Regenerate the design reference's default-theme snapshot (`design-system/themes/industrial/tokens.json`, `tokens.css`; `themes/default/` until the rename of 2026-10-25) and `components/bundle.css` from the package after each value change, and re-render the cards with the repository's producer (ADR-UIP-VIS-002 item 4). First run: the material shadows of #110. | The snapshot equals the package's default-theme values; every card's light and dark render is regenerated in the same pull request. |
| I7    | Styling Lead     | Make every styled component design-agnostic (ADR-UIP-VIS-001 revision 3, item 8; TDD styled HK1–HK9): each presentational value reads a `--scnx-{component}-{part?}-{property}-{state?}` hook that falls back to a Tier-2 token, listed with its review record in the component's specification, and the guarded floors live in component CSS. Done: Button and IconButton (#130), the atoms (#131), the organisms (#132), the Panda recipes (#133), the entry-specification components (#134), and, in #135, the rule applied to every component (HK8) and IconButton `shape="circular"` (HK9). | The stylesheet gate finds no Tier-2 token or literal outside a hook in `components` or `recipes`; every hook is listed in its specification in both directions; computed values in the shipped themes are unchanged, so Chromatic shows no delta except a new story. |
| I8    | Integration Lead | Give TableOfContents a controlled `activeId` (TDD primitives P27) so ui-platform-docs can set the current section from its own router or scroll-spy (docs migration, Instrument · Square). In #135. | Component tests and the Controlled story pin both modes; no TableOfContents prop reaches the `nav` element. |

### Component waves

Every new component is born with its specification (ADR-UIP-CMP-001 item 11)
and built to its card in the design reference. The reference defines 21
components the package does not have yet.

- **Wave 1** (nine components): Badge, Alert, and IconButton (merged in #108,
  `candidate`), then Table, Link, Kbd, SegmentedControl, Tooltip and Popover,
  and Menu. `Surface` is row I3. This is the set ADR-UIP-CMP-001 and
  ADR-UIP-VIS-001 call component wave 1; it was the 2026-10-23 work plan and is
  recorded here on 2026-10-24. The owner may reorder it by pull request.
- **Wave 2** (not ordered): Avatar, Breadcrumb, Checkbox, Pagination, Progress,
  Radio, Select, Sheet, Skeleton, Spinner, Switch, Textarea, and Toast.

"P1" in "Later work" below is the release contract, not a component wave.

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

A consumer budget is approved only when the accountable technical owner of the
named consuming Product team and the UI Platform Release Lead accept the exact
scenario, artifact digest, runner/device, metric, threshold, and measurement
method. A durable Product-specific budget is recorded in that consumer's SAD or
TDD; a pilot/release budget is recorded in the immutable release evidence
packet. A fixture without a named consumer and both approvals produces
comparative evidence only and cannot claim an approved budget. Architecture
Authority owns any waiver from an applicable enterprise standard.

## Later work

- **P1 — release contract:** support matrix, semantic-versioning policy,
  deprecation window, Component ACRs, migration rehearsal, provenance, and
  rollback record.
- **P2 — representative slice:** Button, one form control, one overlay, and one
  composite widget through all applicable gates.
- **P3 — beta pilots:** named standalone and, only if separately authorized,
  federated consumers covering localization, bidirectional layout, multi-brand
  isolation, responsive reflow, touch targets, budgets, migration, and support.
  A pilot installs a published beta, so it waits for the registry decision of
  lien L3 (proposed ADR-UIP-REL-001). The pilot's migration evidence lists any
  use of the baseline Sidebar custom properties that v1 removed (TDD styled,
  "Rollout and Compatibility").
- **P4 — stable:** exact-version approval, release evidence, and at least one
  real consumer migration and rollback rehearsal.
