# Release review — P0 exit

Status: **audit record; non-normative**.

## Scope

This record reviews PLAN P0 rows 0–11 and the component workshop (W1–W2)
against one attested evidence packet (TDD packaging R1–R6). It records the
evidence and the open items. It does not decide the P0 exit: that decision is
recorded below only after the authorized human states it for this exact packet
digest. Merging this record, and CI success, are evidence, not approval
(ROADMAP).

| Item                  | Value                                                                                            |
| :-------------------- | :----------------------------------------------------------------------------------------------- |
| Evidence packet       | [`evidence/p0/6d030a9.json`](../../evidence/p0/6d030a9.json), byte-identical to the CI artifact  |
| Packet SHA-256        | `1263488f863510a50933cd0a707ef345cec1c583dd9c4a5db4939bdd1950e141`                               |
| Packet result         | `pass`, no failures                                                                              |
| Packet attestation    | SLSA provenance, signer `ci.yml@refs/heads/main`, Sigstore transparency log index `3060302740`   |
| Source commit         | `6d030a920c3b0e2031d80503c6c6335efd693708` (`main`, merge of #36)                                |
| CI run                | `37050521714`, attempt 1 (the link expires 90 days after the run; the packet embeds its results) |
| Architecture snapshot | `scnehaux-architecture` at `2aedd35d556f9f06de4d25d46a91357d1cf860a8` (merge of #38)             |

Verify the packet with
`gh attestation verify evidence/p0/6d030a9.json -R anshacerbia2/ui-platform`.

## P0 exit review disposition

Each row's jobs and report digests are copied from the packet. "Evidence
passes" means the packet records a pass; it is not an exit decision.

| Row   | Work                                             | Jobs (all `success`)                              | Report SHA-256 (first 12)                                                                        | Disposition                         |
| :---- | :----------------------------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------- | :---------------------------------- |
| 0     | Clean install gate and required CI               | Clean install; CI policy                          | —                                                                                                | Evidence passes                     |
| 1     | Central architecture linter, document contract   | Documentation gates; Central governance linter    | —                                                                                                | Evidence passes                     |
| 2     | Source tests and declaration heap                | Source tests; Build with default heap             | build-time `6b25ed89bc30`; build log `8fa1cfc1d688`                                              | Evidence passes                     |
| 3     | Packaging and isolated consumers                 | Packed consumer                                   | pack `5d8d8b0b0983`; consumer `cb9e7c0202d8`                                                     | Evidence passes                     |
| 4     | Token output                                     | Token gate                                        | token `549f7bfb710a`                                                                             | Evidence passes                     |
| 5     | Component CSS delivery                           | Packed consumer                                   | browser-components `c43a8219d30a`                                                                | Evidence passes                     |
| 6     | Theme provider and transitions                   | Packed consumer                                   | browser-theme `86b7f49b1b8b`                                                                     | Evidence passes                     |
| 7     | Primitive behavior                               | Source tests; Packed consumer                     | browser-theme `86b7f49b1b8b` (packed behavior matrix)                                            | Evidence passes                     |
| 8     | Entry environments and Next.js App Router        | Packed consumer                                   | nextjs `af7f803bd9d2`; pack `5d8d8b0b0983`                                                       | Evidence passes                     |
| 9     | Conditional federation evaluation                | Packed consumer                                   | federation `72cd9d2394db`                                                                        | Evidence passes                     |
| 10    | Security, supply chain, side effects, strict CSP | Packed consumer; Provenance and SBOM attestations | imports `ff9d5e3f519c`; audit `c0b964cf7088`; license `a44f1c480e11`; SBOM report `21648f0a7c2c` | Evidence passes                     |
| W1–W2 | Component workshop                               | Storybook tests; Chromatic visual review          | —                                                                                                | Evidence passes                     |
| 11    | Evidence packet and exit review                  | P0 evidence packet; P0 evidence attestation       | packet `1263488f8635`                                                                            | Evidence passes; exit decision open |

Published artifacts in the packet:

| Package               | `.tgz` SHA-256 (attested)                                          | Content SHA-256 (equal on both runners)                            | SBOM SHA-256                                                       |
| :-------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------- |
| `@scnx/core-ui@1.0.0` | `c30ebd827455a45c94864375dc37096d9a64c35572320b25aea817727733372a` | `7d5466e7cd4ea4fa9e524d60c33ec91f0a399efd424031eb6959efb552a27c81` | `01ec6a947fbe4dff9532942d6d34057674a2cdae5375bcb5a88755ef5589943e` |
| `@scnx/system@1.1.0`  | `55ccfe0b307239e550a57a6bcb31b215207e92d1409d03172a7c0d7f387fb318` | `ddf40da2db614a0ed539179a8c7f7b22bb4c0ee76a6e17dab322bc81589a8bdb` | `57090a4e01c3916d4538494061c42ba4aa8799f0822ef710410b19ef2522a48c` |

Both provenance and SBOM attestations verify for each tarball. The `.tgz`
digests equal those attested at `84f0e2d`, because no package source changed
since; a local rebuild on another machine produced the same content digests.

## Open items

Revisions pending exact-commit ratification under GDC-000 section 2.6.7, with
the commit that last changed each:

| Repository            | Record                                   | Candidate commit                           |
| :-------------------- | :--------------------------------------- | :----------------------------------------- |
| scnehaux-architecture | SAD-003                                  | `421f5d921b70f65b34004bd4784fc967a7d52f32` |
| ui-platform           | TDD packaging (K, F, S, E, V, R records) | `60eb1f85065560b41830a674d0920ed4a24dd859` |
| ui-platform           | TDD primitives (P1–P12)                  | `5fa6e50dee009189a7dfd6b0c3c48cb9ae00b5ff` |
| ui-platform           | TDD styled CSS delivery                  | `8dc04d77a7360b414c800a1c674705bc737746a5` |
| ui-platform           | TDD theme (THM-009, T1–T3)               | `0826a751ccd39d0d71cd1b4b87ac950922a2ec86` |

Architecture decisions recorded as `proposed`, as stored:

- ADR-UIP-WKS-001 (Storybook workshop), last changed in `e756d64`;
- ADR-UIP-SEC-001 (supply-chain evidence), last changed in `421f5d9`.

Technology Radar entries owned by the UI Platform and marked pending ARB:
`oklch`, `sass`, `panda-css`, `tsup`, `storybook`, `chromatic`, `cyclonedx`,
`github-artifact-attestations`, `vite` (trial); `rspack`, `react-aria`,
`dtcg-design-tokens` (assess).

Known limits, each verified absent from the exports where it applies: no
CommonJS output; Module Federation is evaluated, not adopted; the Next.js
fixture runs without a nonce CSP; no license allow-list is enforced; tarball
bytes are retained for at most 90 days until the Developer Platform supplies
package storage.

Entry stability: 5 entries are `candidate` in the behavior inventory and 39 are
unclassified; no entry is `stable`, so no failed capability can be in a stable
export.

Sequence deviations, recorded as facts: the supply-chain provenance service was
implemented (#35) before its ADR and SAD-003 revision (architecture #38); the
row 8 and row 11 implementations (#27, #37) merged before their decision
records (#26, #36).

## Decision basis

Three decisions remain, each owned by a human authority. This section records
the practice each follows, with its sources, and a recommendation. A
recommendation is not a decision.

| Decision                                                                                           | Practice and sources                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1. Ratify the five pending revisions                                                              | A baseline is a set of specifications "formally reviewed and agreed on at a given point in time, and which can be changed only through change control procedures" [1]. GDC-000 section 2.6.7: a changed revision "becomes effective only when the human authority … explicitly approves the exact commit or ratification manifest containing the revision", and "At ratification, the artifact's `last_reviewed` date and any required lifecycle metadata are updated in the exact approved commit or manifest" [2]. | Prepare one ratification-manifest commit per repository that removes the pending notices and updates `last_reviewed`, as the 2026-09-29 ratification did; the authority approves those exact commits before merge. Ratify first, so D3 is judged against an approved baseline.                                                                                                                                                                                                                                                   |
| D2. Accept or reject ADR-UIP-WKS-001 and ADR-UIP-SEC-001; transition the pending-ARB radar entries | A decision is "'proposed' if the project stakeholders haven't agreed with it yet, or 'accepted' once it is agreed" [3]. "If the team approves the ADR, the owner adds a timestamp, version, and list of stakeholders. The owner then updates the state to Accepted"; "When the team accepts an ADR, it becomes immutable" [4]. Radar maturity transitions are an ARB vote (GDC-004 section 3.2) [5]; a trial technology is "ready for use, but not as completely proven as those in the Adopt ring" [6].             | Review both ADRs; on acceptance, record date, version, and stakeholders in each Status table. Vote each pending radar entry separately: `oklch` first, because its trial ended on 2026-08-01 and its transition is overdue.                                                                                                                                                                                                                                                                                                      |
| D3. P0 exit                                                                                        | Phases are "separated by Key Decision Points (KDPs)", events "at which the decision authority determines the readiness of a program/project to progress to the next phase"; "Decisions to proceed may be qualified by liens that should be removed within an agreed-to time period" [7]. ROADMAP: CI, merge, and linter success are evidence, not approval.                                                                                                                                                          | After D1, a "go with liens" decision for packet `1263488f…`, each lien with an owner and a date: L1 license acceptance policy (V4), Security Lead with legal, before the reference slice (2026-11-20); L2 Next.js App Router nonce-CSP fixture (S1), Packaging Lead, 2026-11-20; L3 long-term package storage and Developer Platform signing (R2; ADR-UIP-SEC-001 item 6), Release Lead, before stable (2026-12-04); L4 stability classification of the 39 unclassified entries, Interaction Lead, with the P1 release contract. |

Sources (retrieved 2026-10-02):

1. NIST SP 800-128, Guide for Security-Focused Configuration Management of
   Information Systems (August 2011, with later errata):
   <https://doi.org/10.6028/NIST.SP.800-128>, "Baseline Configuration".
2. GDC-000, Governance Policy, section 2.6 item 7, in `scnehaux-architecture`
   at `2aedd35d556f9f06de4d25d46a91357d1cf860a8`.
3. Michael Nygard, "Documenting Architecture Decisions", 15 November 2011:
   <https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions>.
4. AWS Prescriptive Guidance, "Architectural decision record process":
   <https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html>.
5. GDC-004, Technology Lifecycle and Standards Governance, section 3.2, same
   commit as [2]: "The ARB manually evaluates and votes to transition
   technologies between `Assessed`, `Trial`, `Adopted`, and `Hold` phases."
6. Thoughtworks Technology Radar, FAQ: <https://www.thoughtworks.com/radar/faq>.
7. NASA Systems Engineering Handbook, NASA/SP-2016-6105 Rev2, section 3.0:
   <https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf>.

## Ratification record

Appended after the ratification candidates merged. Earlier sections are kept
as written; the D1 candidates listed under Open items are now ratified.

| Repository            | Ratified revisions                       | Candidate commit (ratified)                | Merge commit | Pull request | CI at candidate and merge |
| :-------------------- | :--------------------------------------- | :----------------------------------------- | :----------- | :----------- | :------------------------ |
| ui-platform           | TDD packaging, primitives, styled, theme | `773a86434ed71610531359c2f8db1c50697721dc` | `96d48de`    | #40          | All jobs passed           |
| scnehaux-architecture | SAD-003                                  | `19a14428bc4bbb87830c07b7a26ce10b28cfc169` | `f6da8ea`    | #39          | Linter passed             |

Authorization under GDC-000 section 2.6.7, stated by Ansha Cerbia on
2026-10-02: "Saya, sebagai ARB dan UI Platform Lead, meratifikasi 773a864
(4 TDD) dan 19a1442 (SAD-003) beserta bukti CI-nya, per 2026-10-02." ("As ARB
and UI Platform Lead, I ratify 773a864 (four TDDs) and 19a1442 (SAD-003) with
their CI evidence, as of 2026-10-02.")

Ratifying SAD-003 does not accept ADR-UIP-WKS-001 or ADR-UIP-SEC-001; both
remain `proposed` until decision D2 is recorded. Decision D3 remains open.

Second ratification, appended the same day: the TDD packaging revision adding
the CI topology decision record C1–C4.

| Repository  | Ratified revision    | Candidate commit (ratified)                | Merge commit | Pull request | CI at candidate and merge                       |
| :---------- | :------------------- | :----------------------------------------- | :----------- | :----------- | :---------------------------------------------- |
| ui-platform | TDD packaging, C1–C4 | `a260bf0ed01aec2db6ca1513574ef27ab8a743fb` | `a6df4c8`    | #44          | CI, Chromatic, and P0 evidence workflows passed |

Authorization under GDC-000 section 2.6.7: asked to state "Saya, sebagai ARB
dan UI Platform Lead, meratifikasi `a260bf0` (TDD packaging C1–C4) beserta
bukti CI-nya, per 2026-10-02", Ansha Cerbia replied "gas" on 2026-10-02.

Third ratification, appended 2026-10-03: the SAD-003 and GDC-001 revisions
that followed decision D2.

| Repository            | Ratified revisions                                                       | Candidate commit (ratified)                | Merge commit | Pull request | CI at candidate |
| :-------------------- | :----------------------------------------------------------------------- | :----------------------------------------- | :----------- | :----------- | :-------------- |
| scnehaux-architecture | SAD-003 (ADRs no longer "proposed"); GDC-001 (`technology_sunset_grace`) | `a98e9bc208373a42c37d97eea9e8096b1d5eadd6` | `9441228`    | #47          | Linter passed   |

Authorization under GDC-000 section 2.6.7, stated by Ansha Cerbia on
2026-10-03: "Saya, sebagai ARB, meratifikasi a98e9bc (SAD-003 + GDC-001)
beserta bukti CI-nya, per 2026-10-03." ("As ARB, I ratify a98e9bc (SAD-003 +
GDC-001) with its CI evidence, as of 2026-10-03.")

D2 outcome: the ARB decision is recorded in `scnehaux-architecture` #44 (merge
`5c3dccd`). ADR-UIP-WKS-001 and ADR-UIP-SEC-001 are accepted; `tsup` is on
hold, with its successor record due 2026-11-01 and its grace window ending
2027-03-31; the other radar positions follow the D2 recommendations record
(`docs/reviews/2026-10-02-d2-arb-recommendations.md`).

## D2 recommendation: `oklch`

Appended 2026-10-02. The `oklch` trial ended on 2026-08-01 with no recorded
ARB transition. Recommendation: **extend the trial to 2026-12-31 and record
explicit adoption criteria; do not adopt yet.** The ARB votes; this is not the
vote.

| Question                                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Assessment                                                                                                                                                                                                                                 |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can browsers render what the packages ship? | The published token CSS uses `oklch()` 1,648 times and `color-mix()` 3 times, and no relative color syntax (`oklch(from …)`). In web-features 3.40.1, "Oklab and OkLCh" and `color-mix()` are Baseline high (newly available 2023-05-09, widely available 2025-11-09); relative colors are Baseline low (2024-09-16) [8]. Widely available means "30 months have passed since the newly interoperable date. The feature can be used by most sites without worrying about support" [9]. CSS Color Level 4 is a W3C Candidate Recommendation Draft (30 September 2026) [10]. | Yes, for the features used. Relative color syntax would not yet meet the same bar.                                                                                                                                                         |
| Does the evidence meet `Adopted`?           | GDC-004 section 2.1: Adopted is "the default mandatory baseline. Deviations require an approved exception waiver"; Trial is "verified in pilot programs. It is recommended for new services, but existing services are exempt" [11]. No Product consumer runs the tokens; P3 pilots are planned for 2026-11-20 (ROADMAP). Every packed browser fixture runs Chromium only.                                                                                                                                                                                                 | No. Adoption would mandate OKLCH for every frontend from one unreleased library and a single browser engine.                                                                                                                               |
| What would make adoption evidence-based?    | STD-UIP-STY-001 requires packed checks "in the supported browser matrix" and STD-UIP-ENG-001 visual regression "across the declared theme and browser matrix" [12]; the matrix is declared with the P1 support matrix (PLAN). Playwright "can run tests on Chromium, WebKit and Firefox browsers" [13].                                                                                                                                                                                                                                                                    | Adoption criteria: (1) the P1 support matrix is declared; (2) the packed token and component fixtures pass in Chromium, Firefox, and WebKit; (3) at least one named Product consumer runs the OKLCH tokens in production; (4) an ARB vote. |
| Why not `Hold`?                             | GDC-004 section 2.2 reserves the sunset strategy for a technology that decays "due to security concerns, obsolescence, or vendor deprecation" [11].                                                                                                                                                                                                                                                                                                                                                                                                                        | None applies.                                                                                                                                                                                                                              |

Sources (retrieved 2026-10-02):

8. web-features 3.40.1 (W3C WebDX Community Group), `data.json`, features
   `oklab`, `color-mix`, `relative-color`:
   <https://github.com/web-platform-dx/web-features>.
9. web.dev, Baseline: <https://web.dev/baseline>. The core browser set is
   Chrome (desktop and Android), Edge, Firefox (desktop and Android), and
   Safari (macOS and iOS).
10. W3C, CSS Color Module Level 4: <https://www.w3.org/TR/css-color-4/>.
11. GDC-004, Technology Lifecycle and Standards Governance, sections 2.1 and
    2.2, in `scnehaux-architecture` at `f6da8ea`.
12. STD-UIP-STY-001 (packed-package checks) and STD-UIP-ENG-001 (visual
    regression), same commit as [11].
13. Playwright, Browsers:
    <https://github.com/microsoft/playwright/blob/main/docs/src/browsers.md>.

## Exit decision

Not recorded. The P0 exit, and the ROADMAP phase-2 state, change only when the
authorized human states the decision for packet SHA-256
`1263488f863510a50933cd0a707ef345cec1c583dd9c4a5db4939bdd1950e141`.

**Decision recorded 2026-10-03: go with liens.** Stated by Ansha Cerbia
(Architecture Review Board and UI Platform Lead) on 2026-10-03, after decision
D1: "go with liens", for the packet above (main `6d030a9`, run `37050521714`,
attested). The decision to proceed is qualified by these liens, each to be
removed by its owner within the agreed time (D3 basis, NASA SP-2016-6105 Rev2
section 3.0):

| Lien | Item                                                                                  | Owner (PLAN role)         | Due                          |
| :--- | :------------------------------------------------------------------------------------ | :------------------------ | :--------------------------- |
| L1   | License acceptance policy for dependencies (TDD packaging V4)                         | Security Lead, with legal | 2026-11-20                   |
| L2   | Next.js App Router nonce-CSP fixture (TDD packaging S1)                               | Packaging Lead            | 2026-11-20                   |
| L3   | Long-term package storage and Developer Platform signing (R2; ADR-UIP-SEC-001 item 6) | Release Lead              | before stable (2026-12-04)   |
| L4   | Stability classification of the 39 unclassified entries                               | Interaction Lead          | with the P1 release contract |

Obligations from D2 that are not liens of this decision: the `tsup` successor
record (due 2026-11-01, GDC-004 section 2.2), and the trial reviews ending
2026-12-31.
