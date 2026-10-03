# Architecture review — L1 recommendations: dependency license policy

Status: **audit record; non-normative**.

## Scope

Lien L1 of the P0 exit decision: a license acceptance policy for dependencies
(TDD packaging V4), owned by the Security Lead with legal, due 2026-11-20.
Today the license gate requires an SPDX expression for every lockfile package
but enforces no allow or deny list. Every claim below was fetched from its
source on 2026-10-03 and checked against the source text.

These are engineering recommendations, not legal advice. The Security Lead
decides, with legal review; nothing here records that decision.

## Facts

- **What ships.** Neither package declares a runtime dependency: `@scnx/core-ui`
  and `@scnx/system` have only peers (`react`, `react-dom`, and the sibling
  package). Their sourcemaps name no source under `node_modules`. Third-party
  material in the tarballs is therefore limited to:
  - the Inter font files in `@scnx/system`, OFL-1.1, a copied asset with a
    provenance record and its license text (V4);
  - the Panda CSS runtime that `@pandacss/generator` 1.12.1 (MIT) emits into
    `src/styled-system/`, compiled into `@scnx/system`. This review found that
    the tarball shipped this code without its MIT notice and that the SBOM
    did not list it. The same pull request records it (TDD packaging V7),
    adds the notice to the packed `LICENSE`, lists it in the SBOM, and makes
    the license gate fail on any unrecorded generated or bundled source.
- **What does not ship.** The 927 lockfile packages are build, test, and
  fixture tooling. By license: MIT 810, Apache-2.0 28, MPL-2.0 25, ISC 20,
  BSD-2-Clause 15, BSD-3-Clause 12, BlueOak-1.0.0 5, MIT-0 4, CC0-1.0 2, and
  one each of `(Apache-2.0 AND BSD-3-Clause)`, `(MIT OR Apache-2.0)`,
  Python-2.0, CC-BY-4.0, CC-BY-3.0, and 0BSD. The non-permissive ones are
  `axe-core` and `lightningcss` (MPL-2.0), `caniuse-lite` (CC-BY-4.0, data),
  `spdx-exceptions` (CC-BY-3.0, data), and `argparse` (Python-2.0).

## L1 review disposition

| ID  | Recommendation                                                                                                                                                                                                                                                               | Basis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :-- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Write the policy down and enforce it as an **allow-list per scope**, not a deny-list. Two scopes: **shipped** (tarball contents: compiled code of V7, copied assets, and the closure of any runtime `dependencies`) and **tooling** (every other lockfile package).          | ISO/IEC 5230 requires "A written open source policy [...] that governs open source license compliance of the supplied software", and a program "capable of managing" use cases such as "Distributed in binary form" and "Contains open source with attribution requirements" [1]. GitHub is deprecating `deny-licenses` in its dependency review action: "a license deny list is a _bad idea_ [...] A deny list provides very limited risk reduction" [2]; its `allow-licenses` option fails pull requests "that introduce dependencies with licenses that do not match the list" [3]. Obligations attach to distribution [5][6], which is why the two scopes differ. |
| R2  | **Shipped allow-list:** MIT, MIT-0, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, BlueOak-1.0.0. Each shipped component's notice travels in the packed `LICENSE` (V7).                                                                                                  | Google's "notice" licenses "allow[] original or modified third-party software to be shipped in any Google product without endangering or encumbering Google source code", provided "any external distributions must include the notice"; the list names MIT, ISC, BSD, and Apache 2.0, and its "unencumbered" list names 0BSD [4]. The Blue Oak Council rates BlueOak-1.0.0 "Model", Apache-2.0, BSD-2-Clause, ISC, and MIT "Silver", and 0BSD, BSD-3-Clause, and MIT-0 "Bronze" [7].                                                                                                                                                                                 |
| R3  | **Shipped by exception only:** OFL-1.1 for font files whose license text ships beside them (Inter is the one recorded exception today); CC0-1.0 and Unlicense after review.                                                                                                  | Google: OFL-1.1 "is not a 'notice' license and has additional restrictions", "Approved for internal use only because of unusual obligations that must be evaluated prior to distribution" [4]. Its conditions: the font "may not be sold by itself", may be "bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license", and "must be distributed entirely under this license" [8]; the provenance record and shipped `OFL.txt` meet them. Google lists CC0 and Unlicense as "unencumbered" but says "Apply this label with caution [...] ask for a special review" [4].                     |
| R4  | **Tooling allow-list:** R2 and R3 plus MPL-2.0, Python-2.0, CC-BY-3.0, and CC-BY-4.0, for packages used unmodified and not redistributed. Modifying or redistributing one moves it to the shipped scope.                                                                     | MPL-2.0 is "reciprocal" at Google: the source obligation "only extends to the contents of the library itself" [4], and MPL-2.0's obligations attach to "All distribution of Covered Software in Source Code Form" and "If You distribute Covered Software in Executable Form" [5]. Google lists "Python Software Foundation" and "Creative Commons 'Attribution' (CC BY)" as notice licenses [4]. Every license in today's lockfile falls under R2–R4, so adopting R4 needs no tooling exception.                                                                                                                                                                     |
| R5  | **Never without a recorded ARB and legal exception, in either scope:** GPL, LGPL, CC BY-SA, AGPL, OSL, SSPL, Business Source License, CC BY-ND, WTFPL, any `LicenseRef-*`, and any identifier not on R2–R4.                                                                  | Google classes GPL, LGPL, and CC BY-SA as "restricted", which "require mandatory source distribution"; "AGPL [...], OSL, and SSPL [...] cannot be used in google3 under any circumstances"; Business Source License is "not allowed"; CC BY-ND is "by_exception_only" [4]. Blue Oak rates WTFPL "Lead": licenses that "lack one or more essential elements of permissive open software licenses" [7]. With an allow-list, anything unlisted fails by default [2].                                                                                                                                                                                                     |
| R6  | **Expressions:** `OR` passes when any alternative is allowed in the scope; `AND` passes only when every operand is; `WITH` passes only when the exception is reviewed.                                                                                                       | SPDX: "If presented with a choice between two or more licenses, use the disjunctive binary "OR" operator"; "If required to simultaneously comply with two or more licenses, use the conjunctive binary "AND" operator" [6].                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| R7  | **Exceptions as records:** `security/license-exceptions.json`, one entry per `name@version` with license, scope, justification, owner, approver, and an expiry of at most 365 days; the gate fails on a missing, malformed, or expired entry, as it does for VEX statements. | GDC-004 section 4.2: approved waivers "must carry an expiration date not exceeding `365 days` from approval" [9]. The advisory gate already enforces the same shape for VEX (TDD packaging V3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Out of scope

- The outbound license of the two packages (`UNLICENSED`, proprietary
  `LICENSE`) is an organizational choice outside L1.
- Consumer applications' own policies: a consumer that installs the peers
  applies its own.

## Decision requested

The Security Lead, with legal, accepts, amends, or rejects R1–R7. On
acceptance, the TDD packaging V4 row records the policy (pending exact-commit
ratification) and the license gate enforces R1–R7 with the exceptions file;
the L1 lien is removed only when its owner states so for that merged commit.

## References

1. OpenChain ISO/IEC 5230:2020, English text at commit
   `968092c97da81a750f03c7b1becbd25bd088b2cb`, sections 3.1.1 and 3.3.2:
   <https://github.com/OpenChain-Project/License-Compliance-Specification/blob/968092c97da81a750f03c7b1becbd25bd088b2cb/ISO-5230-2020/en/ISO-5230-2020.md>.
2. GitHub `actions/dependency-review-action` issue #938, "Deprecate the
   deny-licenses option":
   <https://github.com/actions/dependency-review-action/issues/938>.
3. GitHub `actions/dependency-review-action` README at commit
   `2f920dad77d7f4f2ea876b66287b896de40dda79`, `allow-licenses`:
   <https://github.com/actions/dependency-review-action/blob/2f920dad77d7f4f2ea876b66287b896de40dda79/README.md>.
4. Google Open Source, "License types":
   <https://opensource.google/documentation/reference/thirdparty/licenses>.
5. Mozilla Public License 2.0, sections 3.1 and 3.2:
   <https://www.mozilla.org/en-US/MPL/2.0/>.
6. SPDX Specification, Annex "SPDX License Expressions", disjunctive and
   conjunctive operators:
   <https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/>.
7. Blue Oak Council, License List, version 16:
   <https://blueoakcouncil.org/list> (`list.json`).
8. SIL Open Font License 1.1, conditions 1, 2, and 5, as shipped in
   `packages/design-system/assets/fonts/OFL.txt`.
9. GDC-004, Technology Lifecycle and Standards Governance, section 4.2
   (`scnehaux-architecture`).
