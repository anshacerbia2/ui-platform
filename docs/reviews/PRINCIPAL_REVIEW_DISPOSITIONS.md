# Principal review dispositions

Status: **audit record; non-normative**.

This is the only folder for Principal Architect review results in the UI
Platform repository. It records what was raised, where the authoritative
resolution lives, and which PLAN/ROADMAP gate proves implementation. It does
not approve architecture, change lifecycle status, or replace the source
documents.

## Document model agreed after review

- `scnehaux-architecture` owns all GDC, EAD, PAD, SAD, ADR, STD, and Technology
  Radar authority according to each record's lifecycle status.
- `docs/designs/` contains exactly five local TDDs and is the only local design
  authority.
- `PLAN.md` owns ordered work and binary acceptance.
- `ROADMAP.md` owns phase state and exit gates.
- This file owns review history only.

## Round 3 review disposition

| Finding                                            | Disposition                                                                                                                                                                   | Authoritative location                              | Execution proof                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| G1 — React and framework security baseline         | Incorporated. Advisories are evaluated from the resolved lockfile or SBOM; framework and `react-server-dom-*` packages are explicit; applicable high/critical findings block. | STD-GLB-FE-006; packaging TDD                       | PLAN rows 3 and 10; ROADMAP phase 2  |
| G2 — global rule-delta traceability                | Incorporated in the replacement decision packet; no local copy is maintained.                                                                                                 | ADR-GLB-FE-010 in `scnehaux-architecture`           | Architecture linter; ROADMAP phase 0 |
| G3 — governance metadata and replacement lineage   | Incorporated. `governed_by`, `authorized_by`, `authorizes`, major-version authorization, and replacement lineage stay in central governance.                                  | GDC-000, GDC-007, GDC-010 and central schemas       | PLAN row 1; ROADMAP phase 0          |
| G4 — unknown production state and binding baseline | Incorporated. Unknown production state uses the fail-safe replacement path; lifecycle status remains explicit.                                                                | GDC-010 and ADR-GLB-FE-011/012/013                  | Architecture linter; ROADMAP phase 0 |
| G5 — primitive semantics                           | Incorporated. Native controls are preferred; composite widgets follow APG; only modal overlays trap focus.                                                                    | STD-UIP-PRM-001; primitives TDD                     | PLAN row 7; ROADMAP phase 2          |
| G6 — federated toolchain                           | Qualified. Rspack applies only after a separate scope authorizes federation; it does not promote Module Federation beyond `assess`.                                           | Technology Radar; ADR-GLB-FE-011/012; packaging TDD | PLAN rows 9–10; ROADMAP phase 2      |
| G7 — token grammar                                 | Incorporated once in central STD; TDD implements and verifies it without creating another grammar.                                                                            | STD-UIP-TKN-001/002; tokens TDD                     | PLAN row 4; ROADMAP phase 2          |
| U1 — CI first                                      | Incorporated. Clean install and required jobs precede feature work.                                                                                                           | PLAN rows 0–2                                       | ROADMAP phases 1–2                   |
| U2 — package exports and peer contracts            | Incorporated in the package TDD.                                                                                                                                              | Packaging TDD                                       | PLAN row 3                           |
| U3 — CSS, theme, and transition behavior           | Incorporated in the CSS and provider TDDs.                                                                                                                                    | Styled and theme TDDs                               | PLAN rows 5–6                        |
| U4 — strict CSP and side effects                   | Incorporated as blocking evidence, not claimed as already passing.                                                                                                            | Packaging and theme TDDs                            | PLAN row 10; ROADMAP phase 2         |
| U5 — contrast, tests, and decision evidence        | Incorporated with binary WCAG gates, `retry: 0`, contextual measurements, and exact-commit evidence.                                                                          | Tokens and primitives TDDs                          | PLAN rows 2, 4, 7, and 11            |

## Counter-review disposition

| Challenge                                       | Final disposition                                                                                                                                                         | Authoritative location                                            | Remaining evidence                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Technology Radar `assess` versus Rspack mandate | Resolved by scope, not by automatic promotion. Module Federation stays `assess`; Rspack is conditional on a separately authorized federation scope.                       | Technology Radar; ADR-GLB-FE-011; packaging TDD; ROADMAP boundary | Conditional fixture in PLAN row 9                                            |
| Broken clean install                            | Accepted as the first implementation blocker. Architecture may be documented while implementation conformance remains false; feature work cannot start before repair.     | README, PLAN entry gate, ROADMAP phase 1, packaging TDD           | Clean CI install with scripts enabled and unchanged lockfile                 |
| Arbitrary 15 KB, 10%, and 2x rules              | Rejected. Comparisons retain compression, parse/evaluation, runner, scenario, baseline, and approved consumer budgets; no universal numeric shortcut is policy.           | ADR-UIP-PLT-001; PLAN measurement rules; primitives/styled TDDs   | Contextual measurements in PLAN rows 5, 7, and 11                            |
| Strict CSP versus dynamic federation loading    | Kept as a hard security gate. Host-controlled nonce/hash propagation must cover bootstrap, remote entry, and chunks; failure blocks federation rather than weakening CSP. | ADR-UIP-PLT-001; packaging/theme TDDs; ROADMAP boundary           | Zero-violation standalone and conditional federation fixtures in PLAN row 10 |
| Legacy major-version governance debt            | Governed explicitly with stable debt IDs, named owners, required actions, and expiry; extension requires ARB disposition. It remains debt until closed.                   | GDC-007 and `base.schema.json` in `scnehaux-architecture`         | Central CI expiry enforcement; no local UI task duplicates it                |

## Open implementation evidence

The following remain open and must not be described as complete:

- deterministic clean install;
- real tests for both packages and default-heap declaration build;
- packed consumer and explicit export verification;
- token grammar, value, font, and contrast validation;
- strict-CSP standalone evidence;
- conditional federation identity, incompatibility, and CSP evidence;
- provenance, license, SBOM, migration, rollback, and real-consumer evidence.

Closing any item requires the exact CI/artifact evidence named in PLAN. A green
documentation or linter job is not implementation conformance or human
approval.
