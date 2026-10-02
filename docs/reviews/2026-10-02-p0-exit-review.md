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

## Exit decision

Not recorded. The P0 exit, and the ROADMAP phase-2 state, change only when the
authorized human states the decision for packet SHA-256
`1263488f863510a50933cd0a707ef345cec1c583dd9c4a5db4939bdd1950e141`.
