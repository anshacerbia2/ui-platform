# UI Platform architecture source of truth

This index identifies the document that owns each decision. As of 2026-09-28, the UI Platform packages have not reached production and no stable package has been released.

The canonical EAD, PAD, SAD, ADR, and STD packet lives in the [Scnehaux architecture repository](https://github.com/anshacerbia2/scnehaux-architecture). This repository owns C3 designs, implementation plans, fixtures, package source, and release evidence.

## Authority and location

| Level      | Canonical owner and location                                                                                       | Authority                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Governance | `scnehaux-architecture/00-governance`                                                                              | Lifecycle, approval, precedence, repository topology, and fitness checks      |
| EAD        | `scnehaux-architecture/01-enterprise/EAD-001` and `EAD-005`                                                        | Enterprise capability and platform boundaries                                 |
| PAD        | `scnehaux-architecture/03-domain/PAD-PLT-003`                                                                      | Logical UI Platform capability, outcome, and ownership                        |
| SAD        | SAD-003 in `scnehaux-architecture/04-system/scnehaux-ui-platform/scnehaux-ui-platform.sad.md`                      | Physical package topology, integration boundaries, NFRs, and release evidence |
| ADR        | `scnehaux-architecture/05-decisions/_global` and `05-decisions/ui-platform`                                        | Decision rationale and authorization                                          |
| STD        | `scnehaux-architecture/02-standards/_global` and `02-standards/ui-platform`                                        | Normative engineering rules after approval                                    |
| TDD        | [docs/designs](designs/)                                                                                           | C3 implementation contracts under the canonical SAD                           |
| Guide      | [docs/07-guides](07-guides/)                                                                                       | Informative usage guidance                                                    |
| Execution  | [PLAN](../PLAN.md), [ROADMAP](../ROADMAP.md), and [release template](architecture/RELEASE_CONFORMANCE_TEMPLATE.md) | Work order and evidence collection                                            |

Governance procedure applies first. EAD and PAD establish authority, accepted ADRs record decisions, active STDs constrain implementation, and SAD/TDD artifacts realize those contracts. Proposed artifacts are review candidates. Conflicting active rules require an authorizing ADR before implementation treats revised wording as binding.

## What binds until ratification

Proposed documents carry no normative authority (GDC-007 section 2.4.1, GDC-010 section 2.4.1). Until the ratification commit lands:

- **Global and UI Platform standards:** the last approved version of each standard binds. For the standards revised in this packet (STD-GLB-FE-001, -002, -005, -006, -007, -009 and the five STD-UIP standards), that is the text at architecture-repository commit `b70f519`.
- **Global frontend decisions:** ADR-GLB-FE-002, ADR-GLB-FE-004, and ADR-GLB-FE-006 are restored to their accepted wording and remain binding. Their proposed replacements, ADR-GLB-FE-011, ADR-GLB-FE-012, and ADR-GLB-FE-013, carry no authority until ratified.
- **UI Platform decisions:** ADR-UIP-TKN-001, -002, -003, and ADR-UIP-BLD-001 bind in their last accepted wording at commit `b70f519`; their corrected text is proposed.
- **Working decisions:** UIP-DEC-001 through UIP-DEC-007 direct P0 implementation work in this repository only. They do not bind any consumer and are not a support claim.

Where the binding baseline and a working decision conflict, P0 work that depends on the working decision is limited to fixtures and unreleased package source until ratification.

## Review state

- ADR-GLB-FE-010 and ADR-UIP-PLT-001 are `proposed`. Each names the standards it authorizes in `authorizes`; each standard names its ADR in `authorized_by` and keeps its `governed_by` attachment to GDC-000 or PAD-PLT-003.
- ADR-GLB-FE-011, ADR-GLB-FE-012, and ADR-GLB-FE-013 are `proposed` replacement ADRs. The approved Experience frontends SAD-002, SAD-012, SAD-014, and SAD-015 are governed by the same global ADRs and have no recorded production status, so GDC-010 requires replacement instead of in-place editing.
- The four corrected UI Platform ADRs are `proposed`; ratification updates each single status row with the actual review date, reviewers, and approver.
- SAD-003 is `proposed`, so the linter validates its complete structure; it also passes validation when simulated as `approved`.
- The five [TDDs](designs/) are `draft`.
- The [decision register](architecture/DECISION_REGISTER.md) contains exactly seven working decisions: UIP-DEC-001 through UIP-DEC-007.
- Ratification requires the machine gate, the named lead approvals, and ARB approval for global artifacts. Merge alone does not substitute for those approvals.

## Roles

These are accountable roles, not people. The ratification commit records the person who holds each role.

| Role             | Accountable for                                                           |
| ---------------- | ------------------------------------------------------------------------- |
| UI Platform Lead | Approval of UI Platform ADRs and stable promotion                         |
| Governance Lead  | Linter integration, document lifecycle, and link integrity                |
| Repository Lead  | CI workflow, repository hygiene, provenance, and license inventory        |
| Test Lead        | Source test suites and build reliability                                  |
| Release Lead     | Packaging, exports, CSS delivery, and release records (UIP-DEC-005, -006) |
| Token Lead       | Token source, emitted CSS, grammar, and contrast gates                    |
| Styling Lead     | Theme isolation and styling ownership (UIP-DEC-002, -003)                 |
| Theme Lead       | Theme provider, CSP, and portal containers                                |
| Packaging Lead   | Server and client entry contracts                                         |
| Integration Lead | Federation fixtures and share policy (UIP-DEC-007)                        |
| Interaction Lead | Widget behavior and the interaction foundation (UIP-DEC-001)              |
| API Lead         | Public API shape and polymorphism (UIP-DEC-004)                           |
| Security Lead    | Dependency security audit                                                 |

## v1 working decisions

1. **UIP-DEC-001 — interaction foundation:** native/custom behavior for simple primitives; selected React Aria hooks for Combobox, Select, Menu, Dialog, Popover, Listbox, and Tabs behind the public API, retained or rejected by the recorded decision rule.
2. **UIP-DEC-002 — theme isolation:** `[data-scnx-theme]` roots, scoped resets, portals inside the theme container, optional separate `:root` compatibility output, and no Shadow DOM claim in v1.
3. **UIP-DEC-003 — styling ownership:** one token source, generated Sass/Panda contracts, Panda frozen to existing recipes during P0, named layers, and a consolidation decision at P0 exit by the recorded rule.
4. **UIP-DEC-004 — polymorphism:** `asChild` at the listed interactive composition points, a closed `as` union for typography/layout, never both on one component.
5. **UIP-DEC-005 — token package:** tokens remain in `@scnx/system` with explicit `@scnx/system/tokens/css`, `json`, and `scss` exports.
6. **UIP-DEC-006 — CSS delivery:** one aggregate component stylesheet plus explicit theme stylesheets, imported once by the composition root; no JS side-effect or remote duplicate imports.
7. **UIP-DEC-007 — federation sharing:** host-owned explicit singleton keys for React, React DOM, `@scnx/core-ui`, and every context-bearing export; no wildcard exports; `requiredVersion` from the consumer's declared range; lazy remotes; a controlled failure for an incompatible version.

P0 means the **pre-release blocking remediation milestone** in [PLAN.md](../PLAN.md).

## Legacy microfrontend documents

The original microfrontend workspace remains untouched. Its local UI TDDs, ADRs, STDs, guides, and backlog are historical inputs for this extraction. Current work starts from this index and follows the canonical authority listed above.
