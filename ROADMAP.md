# UI Platform roadmap

The roadmap advances through evidence gates. The current state is an extracted baseline.

| Phase                       | Deliverable                                                                                                                                     | Exit criterion                                                                                                     | Target review     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 0. Governance and P0 repair | Fully validated review packet, source tests, `pnpm pack` consumer, fixed CSS/fonts/exports/provider/RSC/widgets, and owned integration fixtures | Every documented baseline scenario passes; UIP-DEC-001 through UIP-DEC-007 have evidence and accountable decisions | 2026-10-23        |
| 1. Contract ratification    | Accepted authorizing ADRs, active STDs, approved SAD, API/theme/support contracts, and release policy                                           | Required leads and ARB approve; status tables name the actual approvers; no normative conflict remains             | Before 2026-10-28 |
| 2. Reference slice          | Representative components and repeatable release pipeline                                                                                       | Source, packed, SSR/RSC, CSP, federation, visual, and accessibility evidence passes for one candidate              | Exit based        |
| 3. Global beta              | Consumer pilots, localization, multi-brand support, migration tooling, and support operations                                                   | Named standalone and federated pilots publish measured budgets and Component ACRs                                  | Exit based        |
| 4. Stable product           | Versioned packages, provenance, deprecation, incident, and rollback procedures                                                                  | Release authority accepts evidence and a real consumer completes a migration rehearsal                             | Exit based        |

## Decision scope

The seven governed items are UIP-DEC-001 interaction foundation, UIP-DEC-002 theme isolation, UIP-DEC-003 styling ownership, UIP-DEC-004 polymorphism, UIP-DEC-005 token packaging, UIP-DEC-006 CSS delivery, and UIP-DEC-007 federation sharing. Their owner, authority, evidence, deadline, and status live in the [decision register](docs/architecture/DECISION_REGISTER.md).

## Quality progression

- Architecture: dependency direction, token semantics, bounded ownership, and clear product authority.
- Artifact: published assets resolve and compute under every supported theme and import path.
- Interaction: native semantics and tested composite keyboard, focus, state, and assistive-technology behavior.
- Operations: compatibility, provenance, support, deprecation, rollback, and measured consumer cost.

Comparative claims require comparative adoption and outcome data. The roadmap creates that evidence.
