# UI Platform roadmap

Status: **ratified architecture and TDD baseline; P0 exited with liens on 2026-10-03 (L2 and L4 removed 2026-10-20); phase 3 in progress**.

The architecture repository owns architecture and governance. The five
[TDDs](docs/designs/) own local component design. [PLAN.md](PLAN.md) owns work
order and acceptance. This roadmap owns phase state, target dates, and exit
gates.

| Phase                            | State       | Target date | Deliverable                                                                                                                                                                                            | Exit gate                                                                                                                                                      |
| -------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Architecture and TDD baseline | Complete    | 2026-10-02  | Mature PAD-PLT-003 and SAD-003; five implementation-ready TDDs; one plan; one roadmap; review records separated by round                                                                               | Both repositories pass documentation/governance gates; human authority approves the exact ratification commits; no duplicate UI architecture authority remains |
| 1. Deterministic bootstrap       | Complete    | 2026-10-09  | Repaired Panda prepare resolution and required clean-install CI job                                                                                                                                    | A clean checkout passes `pnpm install --frozen-lockfile` with scripts enabled, no bypass flag, and no lockfile mutation                                        |
| 2. P0 repair and evidence        | Complete    | 2026-10-30  | Source tests, packed consumers, corrected tokens/CSS/provider/primitives, security evidence, strict-CSP standalone fixture, conditional federation evaluation, and the component workshop (PLAN W1–W2) | Every applicable P0 PLAN row passes against exact commits and artifacts; failed capabilities remain outside stable exports                                     |
| 3. Reference slice and beta      | In progress | 2026-11-20  | Four-component reference slice, repeatable release pipeline, named consumer pilots, migration/support evidence, spatial identity (PLAN I1–I6), component wave 1                                                                                         | Source, packed, SSR/RSC, CSP, accessibility, visual, localization, performance, provenance, migration, and rollback gates pass for the supported scope         |
| 4. Stable release                | Not started | 2026-12-04  | Versioned packages and operating model                                                                                                                                                                 | Human release authority accepts exact-version evidence and at least one real consumer completes migration and rollback rehearsal                               |

Phase evidence:

- **Phase 0:** architecture ratification merged as `cf748f6` (candidate
  `84a99ae`, PR #17); TDD ratification merged as `03cdefe` (candidate
  `56ba42b`, PR #6). Both merges were made on 2026-09-29.
- **Phase 1:** the `Clean install` job passes on `main` at `281aae8` (PR #7)
  with lifecycle scripts enabled and a frozen lockfile. The recorded Panda
  `prepare` failure did not reproduce on a clean runner; it was caused by a
  stray Yarn Plug'n'Play manifest in one developer's home directory, which
  esbuild used while bundling `panda.config.ts`.
- **Phase 2:** exit decided on 2026-10-03 by Ansha Cerbia (Architecture Review
  Board and UI Platform Lead): go with liens L1–L4, for evidence packet
  `1263488f…` (main `6d030a9`, run `37050521714`, attested). Record:
  [P0 exit review](docs/reviews/2026-10-02-p0-exit-review.md), "Exit decision".
- **Phase 3 (in progress):** the four-component reference slice exists as
  `candidate` entries (Button; TextField, Dialog, and Tabs in #64–#66;
  right-to-left Tabs in #70), each through the source, packed, SSR/RSC, CSP,
  accessibility (three engines), and visual gates; the P1 release contract is
  implemented (#60–#62); payload and runtime measurements run on every change as
  comparative evidence (TDD packaging PF1–PF6); interaction traces gate the
  forced layouts of every dynamic-height transition (TDD theme X1–X5); token
  contrast is proven on every display path of out-of-gamut colors (TDD tokens
  G1–G3); component styles use governed values only, and every focusable part
  meets the 24 px pointer target (TDD styled GV1–GV7). CodeSelect, found on
  2026-10-21 to be a pointer-only list without combobox semantics, now runs on
  ComboboxBase, an APG editable combobox built without a third-party library
  (ADR-UIP-PLT-001 UIP-DEC-001 revised and accepted 2026-10-21; TDD primitives
  P18); TableOfContents scrolling respects reduced motion and ends at
  `scrollend` (P19). The Tier-1 color scales have one producer: a generator on the Radix Colors custom-palette algorithm with WCAG 2.2 constraints solved on the gate's display paths, checked for a fresh generation in CI (TDD tokens PG1–PG11). Button's recipe follows the token doctrine: the primary
  label is its scheme's `contrast` token (it was near-black on blue in dark
  mode), the secondary is tonal, and disabled is a token pair, not opacity (TDD
  styled BR1–BR3, tokens SD1–SD2). The release pipeline exists (accepted ADR-UIP-REL-001; TDD
  packaging RL1–RL6; packages on `2.0.0-beta.0`). Remaining: the first staged
  release, which waits for the owner's preconditions (a second `@scnx` Owner
  with 2FA, a trusted publisher per package, the `release` environment) and
  removes lien L3, named consumer pilots with approved budgets (no pilot named
  yet; ADR-IAM-012 keeps identity-experience on local components), manual NVDA
  and VoiceOver results for ComboboxBase and Tabs before stable promotion
  (STD-UIP-PRM-001), and migration and rollback evidence.
  Design-tool path: the package emits a Figma profile and ships a first-party
  Figma plugin that writes variables, text styles, and effect styles from it
  (ADR-UIP-TKN-004; TDD tokens FG1–FG11; #109). Spatial identity
  (ADR-UIP-VIS-001): tokens in #110, then the component, Surface, docs-site, and
  Figma rows I2–I5 of the plan.
  Scope added on 2026-10-24: the spatial identity (PLAN I1–I6; I1 merged in
  #110) and component wave 1 (PLAN "Component waves"; Badge, Alert, and
  IconButton merged in #108). I2 restyles Button, TextField, Dialog, and Tabs,
  so the reference slice's visual and contrast evidence is produced again after
  it. The 2026-11-20 target was set before this scope and has not been
  re-estimated; the owner decides whether it holds. The visual target is the
  design reference repository (ADR-UIP-VIS-002).

## Information security gates (ISMS-005, 2026-11-01)

The approved risk treatment plan
([ISMS-005](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/07-isms/ISMS-005-risk-treatment-and-soa.md#treatment-plan))
makes these stable-release (phase 4) items for this repository. Each risk (R) is rated in
[ISMS-004](https://github.com/anshacerbia2/scnehaux-architecture/blob/main/07-isms/ISMS-004-risk-register.md#the-register);
each action (T) has its owner role and target date there. When an action completes, this list and
the SoA in ISMS-005 change together.

- ⏳ **Every action is pinned by commit, not by tag** (T6, R14; by 31 December 2026). The attest job
  holds `id-token: write`, so a moved tag there could sign a build this repository did not make.
- ⏳ **A failed scheduled run alerts the Information Security Officer** (T4, R21; by 30 November
  2026). Today a failed run of `ci` alerts nobody; it shows only to someone who opens the Actions
  tab.
- ⏳ **Secret scanning in CI** (T5, R7; by 15 December 2026), as STD-IAM-001 §5 lists. Today nothing
  scans a change for a secret before it reaches this public repository.
- ⏳ **The shared workflows are called at a pinned commit** (T6, R14; by 31 December 2026). Today
  `linter.yml` is called from scnehaux-architecture's `main` branch, so a change there changes what
  this repository's CI runs.
- ⏳ **A second person's approval on `main`** (T19, R19 and R23; before the stable release). A ruleset
  requires one approval once a second maintainer exists; until then each merge is a recorded risk.

## Non-negotiable boundaries

- CI, merge, and linter success are evidence, not human lifecycle approval.
- Module Federation remains `assess`. The P0 federation fixture is an
  evaluation; Rspack is conditional on a separately authorized federation
  scope. Failure reopens federation, never strict CSP.
- Strict CSP rejects `unsafe-eval` and `unsafe-inline`; dynamic remote/chunk
  loading must use consumer-controlled nonces or hashes with zero violations.
- Human approval of the implementation-ready SAD/TDD baseline and a clean
  install precede package feature work.
- Comparative measurements retain full context; no universal 15 KB, 10%, or
  2x rule exists.
- Proposed/draft architecture remains proposed/draft until the authorized human
  transition is recorded in `scnehaux-architecture`.

Target dates are delivery commitments owned through PLAN role accountability,
not architectural facts or evidence of completion. The Repository Lead owns
roadmap date maintenance; the accountable phase roles supply any slip
disposition. A missed target is updated in this roadmap and does not weaken an
exit gate.
