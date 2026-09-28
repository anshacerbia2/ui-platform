# UI Platform roadmap

Status: **documentation baseline in review; deterministic bootstrap is next**.

The architecture repository owns architecture and governance. The five
[TDDs](docs/designs/) own local component design. [PLAN.md](PLAN.md) owns work
order and acceptance. This roadmap owns only phase state and exit gates.

| Phase                            | State              | Deliverable                                                                                                                                                       | Exit gate                                                                                                                                                  |
| -------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Architecture and TDD baseline | In review          | Canonical architecture updates in `scnehaux-architecture`; five aligned TDDs; one plan; one roadmap; one principal-review disposition record                      | Both repositories pass their documentation/governance gates; architecture lifecycle states remain truthful; no duplicate UI architecture authority remains |
| 1. Deterministic bootstrap       | Next               | Repaired Panda prepare resolution and required clean-install CI job                                                                                               | A clean checkout passes `pnpm install --frozen-lockfile` with scripts enabled, no bypass flag, and no lockfile mutation                                    |
| 2. P0 repair and evidence        | Blocked by phase 1 | Source tests, packed consumers, corrected tokens/CSS/provider/primitives, security evidence, strict-CSP standalone fixture, and conditional federation evaluation | Every applicable P0 PLAN row passes against exact commits and artifacts; failed capabilities remain outside stable exports                                 |
| 3. Reference slice and beta      | Not started        | Four-component reference slice, repeatable release pipeline, named consumer pilots, migration/support evidence                                                    | Source, packed, SSR/RSC, CSP, accessibility, visual, localization, performance, provenance, migration, and rollback gates pass for the supported scope     |
| 4. Stable release                | Not started        | Versioned packages and operating model                                                                                                                            | Human release authority accepts exact-version evidence and at least one real consumer completes migration and rollback rehearsal                           |

## Non-negotiable boundaries

- CI, merge, and linter success are evidence, not human lifecycle approval.
- Module Federation remains `assess`. The P0 federation fixture is an
  evaluation; Rspack is conditional on a separately authorized federation
  scope. Failure reopens federation, never strict CSP.
- Strict CSP rejects `unsafe-eval` and `unsafe-inline`; dynamic remote/chunk
  loading must use consumer-controlled nonces or hashes with zero violations.
- Clean install precedes package feature work.
- Comparative measurements retain full context; no universal 15 KB, 10%, or
  2x rule exists.
- Proposed/draft architecture remains proposed/draft until the authorized human
  transition is recorded in `scnehaux-architecture`.

Target dates belong in delivery tracking after owners commit to them. This
roadmap does not present unapproved dates as architectural facts.
