# UI Platform roadmap

The roadmap advances through evidence gates. The current state is an extracted baseline.

| Phase                     | Deliverable                                                                                                                                    | Exit criterion                                                                                                                         | Target review                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 0. Contract ratification  | Ratified authorizing and replacement ADRs, active STDs, approved SAD, and UIP-DEC-001 through UIP-DEC-007 recorded with their decision rules   | Required leads and ARB approve; status rows name the actual approvers; linter passes with zero failures; no normative conflict remains | Decisions recorded 2026-10-16; ratification before 2026-10-28 |
| 1. P0 repair and evidence | CI, source tests, `pnpm pack` consumer, repaired tokens/fonts/CSS/exports/provider/RSC/widgets, security audit, and owned integration fixtures | Every P0 row in PLAN passes in CI; every decision has its evidence and a recorded outcome                                              | P0 exit 2026-11-27                                            |
| 2. Reference slice        | Representative components and repeatable release pipeline                                                                                      | Source, packed, SSR/RSC, CSP, federation, visual, and accessibility evidence passes for one candidate                                  | Exit based                                                    |
| 3. Global beta            | Consumer pilots, localization, multi-brand support, migration tooling, and support operations                                                  | Named standalone and federated pilots publish measured budgets and Component ACRs                                                      | Exit based                                                    |
| 4. Stable product         | Versioned packages, provenance, deprecation, incident, and rollback procedures                                                                 | Release authority accepts evidence and a real consumer completes a migration rehearsal                                                 | Exit based                                                    |

## Decision scope

The seven governed items are UIP-DEC-001 interaction foundation, UIP-DEC-002 theme isolation, UIP-DEC-003 styling ownership, UIP-DEC-004 polymorphism, UIP-DEC-005 token packaging, UIP-DEC-006 CSS delivery, and UIP-DEC-007 federation sharing. Their owner, authority, alternatives, evidence, decision rule, and dates live in the [decision register](docs/architecture/DECISION_REGISTER.md).

## Quality progression

- Architecture: dependency direction, token semantics, bounded ownership, and clear product authority.
- Artifact: published assets resolve and compute under every supported theme and import path.
- Interaction: native semantics and tested composite keyboard, focus, state, and assistive-technology behavior.
- Operations: compatibility, provenance, support, deprecation, rollback, and measured consumer cost.

Comparative claims require comparative adoption and outcome data. The roadmap creates that evidence.
