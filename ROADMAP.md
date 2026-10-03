# UI Platform roadmap

Status: **ratified architecture and TDD baseline; P0 exited with liens on 2026-10-03**.

The architecture repository owns architecture and governance. The five
[TDDs](docs/designs/) own local component design. [PLAN.md](PLAN.md) owns work
order and acceptance. This roadmap owns phase state, target dates, and exit
gates.

| Phase                            | State       | Target date | Deliverable                                                                                                                                                                                            | Exit gate                                                                                                                                                      |
| -------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Architecture and TDD baseline | Complete    | 2026-10-02  | Mature PAD-PLT-003 and SAD-003; five implementation-ready TDDs; one plan; one roadmap; review records separated by round                                                                               | Both repositories pass documentation/governance gates; human authority approves the exact ratification commits; no duplicate UI architecture authority remains |
| 1. Deterministic bootstrap       | Complete    | 2026-10-09  | Repaired Panda prepare resolution and required clean-install CI job                                                                                                                                    | A clean checkout passes `pnpm install --frozen-lockfile` with scripts enabled, no bypass flag, and no lockfile mutation                                        |
| 2. P0 repair and evidence        | Complete    | 2026-10-30  | Source tests, packed consumers, corrected tokens/CSS/provider/primitives, security evidence, strict-CSP standalone fixture, conditional federation evaluation, and the component workshop (PLAN W1–W2) | Every applicable P0 PLAN row passes against exact commits and artifacts; failed capabilities remain outside stable exports                                     |
| 3. Reference slice and beta      | Not started | 2026-11-20  | Four-component reference slice, repeatable release pipeline, named consumer pilots, migration/support evidence                                                                                         | Source, packed, SSR/RSC, CSP, accessibility, visual, localization, performance, provenance, migration, and rollback gates pass for the supported scope         |
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
