# UI Platform working consensus

Status: **approve with required changes; formal ratification pending**, 2026-09-28.

The architectural direction, technology method, three-tier token model, two-package baseline, evidence model, and composition-root CSS contract have principal support. The remaining work closes normative conflicts, governance mechanics, and executable acceptance gates. This summary carries no independent normative authority.

## Product boundary

- Three logical token tiers: core values, semantic intent, and component aliases.
- Two v1 packages: `@scnx/core-ui` for headless behavior and `@scnx/system` for tokens, themes, styled components, and static assets.
- Dependency direction: `@scnx/system` may consume `@scnx/core-ui`.
- Tokens remain physically inside `@scnx/system` and gain stable `@scnx/system/tokens/*` exports.
- Downstream products own business workflows and complete-page accessibility conformance.

## Seven working decisions

The authoritative register is [DECISION_REGISTER.md](DECISION_REGISTER.md). Its complete set is:

1. UIP-DEC-001 interaction foundation.
2. UIP-DEC-002 scoped multi-brand theming.
3. UIP-DEC-003 Sass/Panda ownership.
4. UIP-DEC-004 bounded polymorphism.
5. UIP-DEC-005 token package boundary.
6. UIP-DEC-006 CSS delivery.
7. UIP-DEC-007 Module Federation sharing.

The register supplies owner, target authority, alternatives, evidence, decision rule, and the two dates (decision recorded 2026-10-16, evidence complete at P0 exit 2026-11-27) for every item. The SOT, PLAN, and roadmap use the same IDs.

## Evidence model

| Level               | Proof supplied                                                     |
| ------------------- | ------------------------------------------------------------------ |
| Source              | State transitions, interaction behavior, types, and static checks  |
| Producer build      | Generated token/style coherence and package build behavior         |
| Packed consumer     | Published exports, types, assets, CSS, fonts, and computed values  |
| Integration fixture | SSR/RSC, strict CSP, theme roots, portals, and federation identity |
| Product page        | Complete WCAG 2.2 conformance in real content and workflow context |

The workspace uses `pnpm pack` because it owns a pnpm workspace and publishes `workspace:*` dependencies. The isolated consumer installs those tarballs without aliases. Every unresolved public variable, invalid substituted property, missing export, duplicate stylesheet, or required fixture failure blocks promotion.

## Round-three governance corrections

- Standards keep `governed_by` for their attachment and name their authorizing ADR in `authorized_by`; the ADR names them back in `authorizes`. The linter enforces the edge and the ADR's status on the final state of each commit.
- The global ADRs FE-002, FE-004, and FE-006 are restored to their accepted wording and remain binding; ADR-GLB-FE-011, -012, and -013 replace them on ratification because the production status of the approved Experience frontends cannot be established.
- ADR-GLB-FE-010 carries a rule-level delta table for every revised global standard.
- The React security floor is an advisory-driven dependency audit over the resolved graph, not a fixed version (STD-GLB-FE-006 section 3.10).
- Token grammar is defined once in STD-UIP-TKN-001, including `solid`, the neutral elevation values, `effect.shadow.*`, and `dimension.z-index.*`.
- Focus indicators are outlines; shadows only enhance them; a forced-colors fixture verifies them.
- Record final dates and approvers only after the corresponding people approve.

## Known baseline defects

P0 covers malformed shadow values, the shadow key-set mismatch between themes, achromatic color output, font drift and packaging, missing design-system tests, declaration-build heap growth, CSS exports, unsafe theme evaluation, global provider callbacks, RSC boundary inference, federation identity, TOC IDs, unused initial state, prop leakage, widget keyboard behavior, Slot provenance, and render-path logging.

A larger Node heap remains a diagnostic. Arbitrary byte limits and universal runtime guarantees require a named measured scenario.
