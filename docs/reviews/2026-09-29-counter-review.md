# Principal counter-review

Status: **audit record; non-normative**.

## Scope

This record preserves the counter-review separately from other review rounds.
It cannot approve architecture, change lifecycle state, or replace a governing
document.

## Counter-review disposition

| Challenge                                       | Disposition                                                                                                                                                     | Authoritative location                                            | Remaining evidence                                                           |
| :---------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| Technology Radar `assess` versus Rspack mandate | Resolved by scope, not automatic promotion. Module Federation stays `assess`; Rspack is conditional on an authorized federation scope.                          | Technology Radar; ADR-GLB-FE-011; packaging TDD; ROADMAP boundary | Conditional fixture in PLAN row 9                                            |
| Broken clean install                            | Accepted as the first implementation blocker. Documentation and CI harness work may proceed; package feature work may not.                                      | PLAN entry gate; ROADMAP phase 1; packaging TDD                   | Clean CI install with scripts enabled and unchanged lockfile                 |
| Arbitrary 15 KB, 10%, and 2x rules              | Rejected. Comparisons retain compression, parse/evaluation, runner, scenario, baseline, and approved consumer budgets; no universal numeric shortcut is policy. | ADR-UIP-PLT-001; PLAN measurement rules; primitives/styled TDDs   | Contextual measurements in PLAN rows 5, 7, and 11                            |
| Strict CSP versus dynamic federation loading    | Kept as a hard gate. Host-controlled nonce/hash propagation covers bootstrap, remote entry, and chunks; failure blocks federation rather than weakening CSP.    | ADR-UIP-PLT-001; packaging/theme TDDs; ROADMAP boundary           | Zero-violation standalone and conditional federation fixtures in PLAN row 10 |
| Legacy major-version governance debt            | Governed with stable debt IDs, owners, required actions, and expiry; extension requires ARB disposition.                                                        | GDC-007 and `base.schema.json` in `scnehaux-architecture`         | Central CI expiry enforcement                                                |

## Open implementation evidence

The following remain open and must not be described as complete:

- deterministic clean install;
- real tests for both packages and default-heap declaration build;
- packed consumer and explicit export verification;
- token grammar, value, font, and contrast validation;
- strict-CSP standalone evidence;
- conditional federation identity, incompatibility, and CSP evidence;
- provenance, license, SBOM, migration, rollback, and real-consumer evidence.

Closing an item requires the exact CI/artifact evidence named in PLAN. A green
documentation job is not implementation conformance or human approval.
