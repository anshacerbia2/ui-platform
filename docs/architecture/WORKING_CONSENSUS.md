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

The register supplies owner, target authority, evidence, review deadline, and status for every item. The SOT, PLAN, and roadmap use the same IDs.

## Evidence model

| Level               | Proof supplied                                                     |
| ------------------- | ------------------------------------------------------------------ |
| Source              | State transitions, interaction behavior, types, and static checks  |
| Producer build      | Generated token/style coherence and package build behavior         |
| Packed consumer     | Published exports, types, assets, CSS, fonts, and computed values  |
| Integration fixture | SSR/RSC, strict CSP, theme roots, portals, and federation identity |
| Product page        | Complete WCAG 2.2 conformance in real content and workflow context |

The workspace uses `pnpm pack` because it owns a pnpm workspace and publishes `workspace:*` dependencies. The isolated consumer installs those tarballs without aliases. Every unresolved public variable, invalid substituted property, missing export, duplicate stylesheet, or required fixture failure blocks promotion.

## Required governance corrections

- Expand ADR-GLB-FE-010 to cover the global styling, React, accessibility, Module Federation, and static CSS conflicts.
- Attach the global ADR to EAD-005 and route its approval to the ARB.
- Add the authorizing ADR to every major-version STD through `governed_by`.
- Align token naming between the token STD and ADR-UIP-TKN-003.
- Validate SAD-003 fully in `proposed` state and preserve its original creation date.
- Align the TDD location to repository-root `docs/designs/`.
- Update the technology radar for the technologies used or evaluated by the platform.
- Record final dates and approvers only after the corresponding people approve.

## Known baseline defects

P0 covers malformed shadow values, the `--ds-shadow-lg` key mismatch, achromatic color output, font drift and packaging, missing design-system tests, declaration-build heap growth, CSS exports, unsafe theme evaluation, global provider callbacks, RSC boundary inference, federation identity, TOC IDs, unused initial state, prop leakage, widget keyboard behavior, Slot provenance, and render-path logging.

A larger Node heap remains a diagnostic. Arbitrary byte limits and universal runtime guarantees require a named measured scenario.
