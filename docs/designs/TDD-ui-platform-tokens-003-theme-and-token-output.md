---
doc_meta:
  id: TDD-ui-platform-tokens-003
  title: Theme and Token Output
  owner: UI Platform Team
  version: 1.0.0
  status: approved
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-10-20
---

# TDD-ui-platform-tokens-003: Theme and Token Output

> **Revision pending exact-commit ratification.** The decision record "display
> paths of out-of-gamut colors" (G1–G3) is pending under GDC-000 section 2.6.7;
> the revision ratified on 2026-10-20 (`bc332cb`) remains binding until the
> authorized human authority approves the exact commit containing these
> changes.

## Purpose

Define one deterministic token pipeline that implements the centrally governed
three-tier language and emits complete, type-correct, scoped, and equivalent
CSS, JSON, Sass, and Panda-facing contracts for every supported theme.

## Scope

In scope: core values, semantic mappings, justified component aliases, default
and achromatic themes, light/dark modes, font metadata, CSS custom properties,
stable `@scnx/system/tokens/*` entries, validation, migration, and release
evidence. DTCG interchange is a target output only after its generator passes
parity. Product tokens and component CSS rules are out of scope.

## Technical Context

Sass maps are the baseline source. The baseline has undefined Panda references,
malformed shadow serialization, unequal public shadow sets, legacy names, and
an invalid achromatic expression. OKLCH does not by itself prove contrast, and
alpha results depend on their actual backgrounds.

| ID      | Contract                                                                                 |
| :------ | :--------------------------------------------------------------------------------------- |
| TKN-001 | Every token has one canonical logical name, type, tier, and owner.                       |
| TKN-002 | Tier 2 never references Tier 3; Tier 3 resolves to Tier 2.                               |
| TKN-003 | Every supported theme/mode exposes the identical public Tier-2 key set and types.        |
| TKN-004 | CSS, JSON, Sass, and Panda outputs derive from one normalized dictionary and agree.      |
| TKN-005 | Every reference resolves; every substituted CSS value parses for its consuming property. |
| TKN-006 | Actual foreground/background and non-text pairs pass applicable WCAG 2.2 gates.          |
| TKN-007 | A focus shadow supplements but never replaces a visible outline.                         |
| TKN-008 | Generated artifacts are reproducible and never hand-edited.                              |

## Component Design

```mermaid
graph LR
  SRC[Canonical Sass token source] --> N[Normalizer]
  N --> V[Contract validator]
  V --> CSS[Scoped CSS emitter]
  V --> JSON[JSON emitter]
  V --> SCSS[Sass compatibility emitter]
  V --> PANDA[Panda adapter]
  CSS --> B[Browser property/contrast tests]
  JSON --> P[Parity test]
  SCSS --> P
  PANDA --> P
```

| Component          | Responsibility                                                                                            |
| :----------------- | :-------------------------------------------------------------------------------------------------------- |
| normalizer         | Convert source maps into ordered typed records; reject duplicate logical names                            |
| contract validator | Enforce central grammar, legal type, tier direction, references, theme coverage, and alias review records |
| emitters           | Serialize the same normalized record set into target formats                                              |
| browser verifier   | Load packed CSS and verify computed values, pairs, roots, and coexistence                                 |
| migration reporter | Map removed baseline names to canonical names and enumerate affected source callsites                     |

The canonical grammar remains owned by STD-UIP-TKN-001. This TDD implements it
and does not fork its vocabulary.

## Data Model

```ts
type TokenRecord = {
  name: string; // canonical dotted name
  cssName: `--ds-${string}`;
  tier: 1 | 2 | 3;
  type:
    | "color"
    | "dimension"
    | "duration"
    | "cubicBezier"
    | "fontFamily"
    | "fontWeight"
    | "number"
    | "shadow"
    | "strokeStyle";
  purpose: string;
  value?: string | number | string[];
  reference?: string;
  component?: string; // required only for Tier 3
  themes: Record<string, Record<string, string | number | string[]>>;
  lifecycle: "candidate" | "stable" | "deprecated";
  replacement?: string;
};
```

Canonical public examples include
`color.primary.surface.solid.default`, `effect.shadow.low`,
`dimension.z-index.modal`, and `dialog.root.z-index.default`. The exact grammar,
allowed vocabularies, role/emphasis/state compatibility, and required alias
review fields are read from the central standards rather than restated locally.

Theme identity is a URL-safe `<theme-id>` identifying the brand; mode is the
separate `light` or `dark` dimension. A public theme is a complete mapping over
the public semantic key set for every declared mode; inheritance may be used in
source only when the resolved output is complete and its parent is explicit.

## API / Interface

| Entry                                      | Content                                                            |
| :----------------------------------------- | :----------------------------------------------------------------- |
| `@scnx/system/tokens/css/<theme-id>.css`   | Scoped public CSS variables for one brand across declared modes    |
| `@scnx/system/tokens/json/<theme-id>.json` | Typed normalized token records for one brand across declared modes |
| `@scnx/system/tokens/scss`                 | Supported Sass variables/functions generated from the same records |

CSS variables use `--ds-` plus the canonical kebab-case path. Public variables
are emitted under
`[data-scnx-theme="<theme-id>"][data-scnx-resolved-mode="<mode>"]`. The theme
ID and resolved mode are separate selector dimensions; `system` is a preference
resolved by the provider and never an emitted CSS mode. A separately exported
single-brand compatibility asset may use `:root` and is excluded from
multi-brand/federated support. Raw Tier-1 scales and internal generator helpers
are not public compatibility contracts.

## Algorithms / Logic

### Normalize and resolve

1. Parse source without coercing quoted keys or units.
2. Create a record for every leaf and reject duplicate canonical/css names.
3. Validate tier, type, grammar, legal vocabulary, and alias justification.
4. Build a directed reference graph; reject cycles and invalid tier direction.
5. Resolve each theme/mode to a complete public semantic map.
6. Reject missing, extra, or differently typed public keys across themes.
7. Serialize typed values with property-aware functions; never use
   `meta.inspect` as a general CSS serializer.
8. Emit all formats from the same ordered records and hash them.

### CSS and visual validation

Parse every stylesheet, collect declarations, and reject syntax errors,
duplicate conflicting declarations, undefined references, or selectors outside
the allowed root. In a browser, substitute each public token into representative
properties (`color`, `background`, `border`, `box-shadow`, typography, spacing,
motion, and z-index) and require a valid computed value.

Contrast evaluates named semantic pairs and all interaction states against
their actual resolved background. Alpha colors are composited before contrast
calculation. The neutral strong border in its default state is the boundary of
controls with no other visual indicator, such as text inputs, and is tested at
3:1 against every declared neutral surface (STD-UIP-TKN-001 2.2.0, WCAG 2.2 SC
1.4.11); on 2026-10-20 the light neutral step 8 moved from L 0.64 to 0.63 to
meet it (minimum 3.11:1, from 2.99:1). A color outside sRGB is tested on every
display path, as decided below.

#### Decision record: display paths of out-of-gamut colors

How STD-UIP-TKN-001 revision 2.3.0 ("Semantic Usage Doctrine") is implemented in
`scripts/tokens/color.mjs`. On 2026-10-20, 94 token names lie outside sRGB; the packed
token stylesheets hold 41 distinct such values.

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Sources                  | Tradeoff                                                                                                                                                                                                                                                                           |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | No fallback value is declared for a color outside sRGB. Every supported browser parses `oklch()` (Baseline Widely available since 2025-11-09 [3]; `support-matrix.json` is Baseline Widely available on 2026-10-03), and the browser's own gamut handling is the fallback.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | STD-UIP-TKN-001 [5]; [3] | No `@media (color-gamut: p3)` or `@supports` duplicate is emitted, so the CSS stays one declaration per token. What a display actually shows is then the browser's choice, which G2 tests.                                                                                         |
| G2  | Contrast is evaluated on four display paths: sRGB clipped, sRGB gamut mapped with the CSS Color 4 algorithm, Display P3 clipped, and Display P3 gamut mapped. The lowest ratio counts, and a finding names its path. CSS Color 4 specifies gamut mapping for an RGB display or a unorm8 canvas [1]. `scripts/browser-gamut.mjs` paints each of those values into an sRGB 2D canvas in every engine and records which result it matches (`gamut-report.json`, evidence row 4). On 2026-10-20, Chromium 153, Firefox 155, and WebKit 26.6 clipped instead: of the 41 values, 14 (Chromium) and 15 (Firefox, WebKit) matched the clipped color more closely and at most 1 the mapped color, with an OKLCH lightness difference of up to 0.013 (CI run of #74). | STD-UIP-TKN-001 [3]; [1] | The spec and the engines disagree, so the gate tests both. The canvas measures a script-visible surface, not the display pipeline itself, which no script can read [1]. CI repeats the measurement on every change.                                                                |
| G3  | Alpha colors are composited in the gamma-encoded space of each path, and relative luminance is taken in that path's color space [2]; for an sRGB color every path gives the same ratio.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | STD-UIP-TKN-001 [4]; [2] | WCAG defines the sRGB formula and asks authors to evaluate in sRGB "Unless it is known that another color space will be used" [2]; the P3 paths extend the same definition to a P3 display. Where a browser composites in another space, the composited ratio can differ slightly. |

On 2026-10-20 all 2,376 contrast cases pass on every path. A color that passes
only when gamut mapped now fails: `oklch(0.66 0.3 105)` on white is 3.05:1
mapped and 2.99:1 clipped, a unit-test case.

The gate reports against the ratified STD-UIP-TKN-001 revision (`STANDARD` in
`scripts/tokens/grammar.mjs`, emitted into the token JSON), which was 2.1.0
(`af6462e`) until 2026-10-20 and is now 2.2.0 (`a93e28f`): the grammar of section
3 is identical in both. It moves to 2.3.0 only when that revision is ratified.

## Configuration

Versioned configuration declares theme IDs, modes, public token families,
browser support, color fallback policy, font assets, alias review records, and
selector roots. An alias review records semantic purpose, Tier-2 fallback,
theme/state coverage, and migration impact; no numerical alias cap is implied.
Unknown configuration keys fail. Environment variables cannot alter public
token values during a release build.

## Failure Handling

| Failure                          | Disposition                                                           |
| :------------------------------- | :-------------------------------------------------------------------- |
| Parse/type/reference/cycle error | Stop generation; emit source path and reference chain                 |
| Theme key-set mismatch           | Block all theme artifacts from that coordinated release               |
| Invalid CSS substitution         | Block affected theme and component promotion                          |
| Contrast failure                 | Block affected semantic pair/state; do not silently adjust at runtime |
| Missing font/license             | Remove reference or supply governed asset before packing              |
| Emitter parity mismatch          | Treat normalized dictionary as unshippable                            |
| Unexpected generated diff        | Fail reproducibility gate and investigate producer ownership          |

## Observability

The token report records source SHA, normalized-root hash, record count by tier
and type, theme/mode key counts, unresolved reference count, alias count,
contrast-case count/failures, CSS parse failures, output sizes, and each output
digest. Logs identify token and source path but never dump the entire palette on
success. Main/release alerts fire on any previously green contract regression.

## Testing Strategy

- Unit: grammar adapter, name conversion, type serializer, reference graph,
  inheritance, alias review validation, alpha compositing, contrast calculation.
- Property/boundary: empty maps, quoted numeric keys, deep paths, cycle chains,
  zero values, multi-shadow lists, font stacks, wide-gamut fallback.
- Negative fixtures: legacy names, unknown roles/states, Tier-3 back-reference,
  missing theme key, wrong type, invalid CSS, duplicate CSS name.
- Golden/parity: stable ordered JSON, Sass/Panda/CSS name/value equivalence,
  reproducible hashes.
- Packed browser: every theme/mode, two roots together, computed properties,
  focus/forced-colors, font loading, no selector leakage.
- Accessibility: WCAG 2.2 SC 1.4.3 and 1.4.11 pairs for default, hover,
  pressed, selected, disabled, and focus states where applicable.

## Performance Notes

Record normalization/build time, peak memory, token count, CSS/JSON bytes by
theme and encoding, unused generated variants in named consumer scenarios, and
style-recalculation cost for theme changes. Budgets are scenario-specific.

## Security Notes

Token input is data, never executable code. Emitters reject strings capable of
escaping declarations or selectors. Outputs contain no secrets or user data.
Font assets carry license and digest records. No runtime string evaluation,
network fetch, or arbitrary consumer-supplied token execution is permitted.

## Operational Notes

Generated-output ownership, token migration, contrast triage, missing-asset
repair, and release rollback have runbooks. A released token set is immutable.
Supported prior themes remain available for their compatibility window.

## Rollout and Compatibility

Before v1, generate a complete baseline inventory, replace malformed/legacy
names, update all repository callsites atomically, and publish no compatibility
aliases unless an external consumer is proven. Then enable validation in report
mode once, fix all findings, switch to blocking mode, pack outputs, rehearse a
consumer migration, and promote an exact digest with human authority.

## Open Questions

- Does an independent token-only consumer justify a third package after v1?
- Which DTCG version and resolver behavior passes full output parity?

These are bounded future decisions; v1 remains Sass-source with generated
multi-format outputs until evidence closes them.

## Traceability

Architecture authority: SAD-003; ADR-UIP-PLT-001 and ADR-UIP-TKN-001/002/003;
STD-GLB-FE-005/009 and STD-UIP-TKN-001/002. Lifecycle status in
`scnehaux-architecture` controls authority. Execution:
[PLAN](../../PLAN.md) P0 rows 4 and 11. Related designs: packaging, CSS delivery,
and theme runtime.

References (retrieved 2026-10-20):

1. W3C, CSS Color Module Level 4, "Gamut Mapping" and "CSS Gamut Mapping to an
   RGB Destination", at csswg-drafts commit
   `160a00acff045d99796606f502812c9462e110e2`, cited in STD-UIP-TKN-001 [3]:
   out-of-gamut values "must be converted to an in-gamut color" for a display;
   the CSS algorithms apply to "an RGB display" and "a canvas, with unorm8
   backing store"; its test annotation says "Actual values of color are not
   exposed to script, making this hard to test in an automated manner."
2. W3C, WCAG 2.2, definition "relative luminance", at w3c/wcag commit
   `457cece22d8219be32d29c5c1313e71aa6b61eae`, cited in STD-UIP-TKN-001 [4]:
   "the relative brightness of any point in a colorspace, normalized to 0 for
   darkest black and 1 for lightest white"; "Unless it is known that another
   color space will be used to process and display the content, authors should
   evaluate using sRGB colorspace."
3. web-features 3.43.0, feature `oklab`, cited in STD-UIP-TKN-001 [5]:
   `baseline_high_date` 2025-11-09, covering `css.types.color.oklch`.
