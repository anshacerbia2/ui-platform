# Principal review — Ratification readiness

Status: **audit record; non-normative**.

## Scope

This record tracks the ten required changes raised during final ratification
review. A disposition of `addressed in proposal` means the branch contains a
candidate correction; it does not mean the principal accepted it or that the
artifact is ratified.

## Ratification-readiness review disposition

| ID  | Required change                                                | Disposition in candidate revision                                                                                                                                                                                                                   | Verification                                                  |
| :-- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| R1  | Exact-revision authority for every approved versioned artifact | Addressed in proposal: GDC-000 section 2.6.7 covers GDC/EAD/PAD/SAD/STD/TDD, preserves the prior binding revision, and requires exact-commit or manifest approval plus ratification-time metadata. PAD 1.4.0 visibly declares pending ratification. | Central governance lint plus principal review of exact commit |
| R2  | Normative topology, navigation-only README, separated reviews  | Addressed in proposal: SAD-003 owns the topology; README contains navigation only; this folder has one file per review round.                                                                                                                       | Local documentation boundary and link gates                   |
| R3  | Remove dangling local decision-register references             | Addressed in proposal: ADR-UIP-PLT-001 labels the seven decisions `UIP-DEC-001` through `UIP-DEC-007`; references now resolve inside that ADR and “decision register” wording is removed.                                                           | Central link/content review                                   |
| R4  | Complete conditional federation contract                       | Addressed in proposal: packaging TDD defines P0 scope, strict singleton/version negotiation, consumer-derived `requiredVersion`, two-party version telemetry, CSP ownership, and route-local failure.                                               | TDD review; future P0 federation fixture                      |
| R5  | Replace numerical alias-budget semantics                       | Addressed in proposal: tokens TDD requires alias review records and explicitly rejects an implied numerical cap.                                                                                                                                    | TDD/STD consistency review                                    |
| R6  | One theme selector contract                                    | Addressed in proposal: central ADR/STDs and all affected TDDs use separate `data-scnx-theme` and `data-scnx-resolved-mode` attributes; `system` remains store preference only.                                                                      | Repository-wide selector search and central lint              |
| R7  | Correct multi-brand theme asset cardinality                    | Addressed in proposal: STY-003 requires one instance of each selected theme asset.                                                                                                                                                                  | TDD review                                                    |
| R8  | Map execution roles to PAD-owned teams                         | Addressed in proposal: PLAN contains role-to-team accountability and records individual actors only in ratification/release evidence.                                                                                                               | PLAN review against PAD section 7.1                           |
| R9  | Define consumer-budget authority and record                    | Addressed in proposal: named Product technical owner and UI Platform Release Lead approve an exact scenario; the consumer SAD/TDD or immutable release packet records it.                                                                           | PLAN review; future release evidence                          |
| R10 | Put delivery targets in the roadmap                            | Addressed in proposal: every phase has a target date; missed targets require owner disposition without weakening exit gates.                                                                                                                        | ROADMAP review                                                |

Ratification remains blocked until all required checks pass and every authorized
principal approves the same exact commit set.
