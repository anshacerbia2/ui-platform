# UI Platform roadmap

This roadmap uses **exit criteria**, not calendar promises. The current state is an extracted baseline. Each phase needs a release-conformance record with links to evidence.

| Phase | Deliverable | Exit criterion |
| --- | --- | --- |
| 0. Baseline and P0 repair | Standalone workspace, running source tests, packed consumer harness, fixes to emitted CSS, fonts, exports, CSP/provider, RSC, federation and exposed widget behavior | Every documented import and supported baseline scenario works from tarballs; failures have regression tests |
| 1. Contract approval | Reviewed canonical SAD/STDs/ADRs, API and theme contracts, support matrix, decision register outcomes | Principals approve major rule changes and the package contract; no unresolved contradiction controls implementation |
| 2. Reference slice | Small representative component set and release pipeline | Source, packed, SSR/RSC, CSP, federation, visual, and accessibility evidence is repeatable for one candidate release |
| 3. Global beta | Consumer pilots, documentation, migration tooling, localization and multi-brand support | Named standalone and federated pilots complete integration; measured budgets and component conformance reports are published |
| 4. Stable product | Versioned packages, support/deprecation policy, provenance, incident/rollback path | Release authority accepts evidence, known limitations, and consumer migration rehearsal |

## Quality progression

- **Architecture quality:** dependency direction, logical token semantics, bounded styling ownership, clear product authority.
- **Artifact quality:** published assets resolve and compute correctly under each supported theme and import path.
- **Interaction quality:** native semantics plus tested composite behavior, focus, keyboard, screen-reader names, and state transitions.
- **Operational quality:** compatibility, provenance, support, deprecation, rollback, and measured consumer cost.

Claims such as “best in the world” or “beyond FAANG” require comparative evidence that the platform delivers lower consumer effort, fewer accessibility and integration defects, predictable upgrades, and competitive runtime cost across real adoption. The roadmap aims to produce that evidence; it does not predeclare the result.

See [PLAN.md](PLAN.md) for item-level work and the [release template](docs/architecture/RELEASE_CONFORMANCE_TEMPLATE.md) for the evidence expected at each candidate release.
