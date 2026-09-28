# UI Platform architecture source of truth

This index answers **which document owns which decision**. It does not turn a proposed decision into an approved one. As of 2026-09-28, no system governed by these UI Platform ADRs has entered production, and this code baseline is not a stable release.

The canonical EAD/PAD/SAD/ADR/STD review packet is on the [architecture review branch](https://github.com/anshacerbia2/scnehaux-architecture/tree/review/ui-platform-sot-20260928). It is separate from the existing approved baseline until principal review and governance merge.

## Authority and location

| Level | Owner and canonical location | Authority |
| --- | --- | --- |
| Governance | `scnehaux-architecture/00-governance` | Document lifecycle, approval, precedence, and fitness checks |
| EAD | `scnehaux-architecture/01-enterprise/EAD-001`, `EAD-005` | UI Platform as a reusable enterprise capability, separate from Workspace Experience and Product authority |
| PAD | `scnehaux-architecture/03-domain/PAD-PLT-003` | Logical UI Platform boundary, outcome, lifecycle, and ownership |
| SAD | `scnehaux-architecture/04-system/scnehaux-ui-platform/SAD-003` | Two physical packages, dependency direction, integration scenarios, and release evidence |
| ADR | `scnehaux-architecture/05-decisions/ui-platform` plus authorizing global ADR | Rationale and approved decisions; proposed ADRs have no authority yet |
| STD | `scnehaux-architecture/02-standards/ui-platform` and applicable global standards | Normative rules after required approval; version 2.0.0 revisions here are proposed |
| TDD | [docs/02-designs](02-designs/) in this repository | C3 implementation design, subordinate to approved SAD/ADR/STD |
| Guide | [docs/07-guides](07-guides/) in this repository | Explanations and current value maps; informative, never overrides a standard |
| Execution | [PLAN](../PLAN.md), [ROADMAP](../ROADMAP.md), [release template](architecture/RELEASE_CONFORMANCE_TEMPLATE.md) | Work order and proof of readiness, not architectural authority |

**Conflict rule:** governance procedure applies first; EAD/PAD set authority, accepted ADRs explain approved choices, active STDs constrain implementation, SAD/TDD realize those contracts. A proposed revision is a review target, not a silent override of an existing approved document. Where two active documents conflict, record the conflict and obtain the authorizing ADR before treating revised rules as binding. The proposed ADR-GLB-FE-003 and ADR-UIP-PLT-001 are the current approval path.

## Current review status

- EAD-001 remains substantively correct and unchanged. EAD-005 now traces UI Platform to PAD-PLT-003. PAD-PLT-003 retains the logical boundary.
- SAD-003 is a **draft**. Seven version 2.0.0 global/UI STDs are **proposed** pending the two authorizing ADRs. Existing token ADRs are being edited in place under the preproduction rule in GDC-010; their revised wording is not merged/ratified by this repository.
- The five [TDDs](02-designs/) are **drafts**. They distinguish observed baseline behavior from release targets. The [working consensus](architecture/WORKING_CONSENSUS.md) summarizes the proposal for principals; it is not another standard.
- React Aria scope, two-brand isolation implementation, long-term Sass/Panda ownership, and public polymorphism remain explicit decision gates in the [register](architecture/DECISION_REGISTER.md). Interim constraints below apply to new work until those decisions close.

## Interim implementation direction

1. Keep **one repository, two publishable packages**: `@scnx/core-ui` and `@scnx/system`. The three token tiers are logical. A token package is added only with independent consumer evidence.
2. Keep Sass as the current token source and Panda as the current recipe generator; do not expand either's ownership until output drift and size are measured.
3. Use native semantics first. Do not promote another complex widget to stable without its keyboard/focus matrix and consumer evidence. React Aria is evaluated, not mandated or excluded.
4. Treat a scoped theme root as the implementation candidate. Do not claim multi-brand support from a document-wide `:root` theme. Two-root tests are the decision evidence.
5. Target an explicit consumer stylesheet import that styles the supported component set. Do not claim JS imports auto-load CSS until the packed consumer proves it.
6. Keep current `as`/`asChild` APIs as baseline behavior; do not expand or declare either universal until the public API decision is approved.

These directions permit P0 work without pretending that unresolved public contracts are final.

## Legacy microfrontend documents

The former microfrontend workspace's `packages/docs` remains untouched. Its five `TDD-SCNX-UI-JS-001…005` files, local `ADR-SCNX-UI-*` and `STD-SCNX-UI-*` files, backlog, and `GD-SCNX-UI-JS-001…003` guides are **historical inputs only for this new UI Platform**. Some have duplicate IDs, old “approved” labels, absolute guarantees, or stale paths. They do not govern this extracted repository. The five new TDDs and three new guides here replace their implementation guidance; central ADR/STD authority stays in `scnehaux-architecture`. The two old guides numbered 002 and 003 are zero-byte files.

No legacy document is physically changed or deleted because the source microfrontend project is out of scope. Consumers of this repository start from this index, then follow the canonical document for the level they need.
