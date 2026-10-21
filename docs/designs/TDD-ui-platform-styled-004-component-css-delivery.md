---
doc_meta:
  id: TDD-ui-platform-styled-004
  title: Styled Components and CSS Delivery
  owner: UI Platform Team
  version: 1.0.0
  status: approved
  classification: public
  parent_sad: SAD-003
  review_cycle_days: 30
  created_date: 2026-09-28
  last_reviewed: 2026-10-21
---

# TDD-ui-platform-styled-004: Styled Components and CSS Delivery

## Purpose

Define the exact seam between headless behavior, styled wrappers, token usage,
theme variables, cascade ownership, and the static CSS a consumer loads. The
design must render correctly from packed artifacts without consumer-side Panda
execution or implicit JavaScript side effects.

## Scope

In scope: `@scnx/system` styled entries, Sass component rules, the frozen Panda
recipe set, aggregate component CSS, theme CSS composition, cascade layers,
selector scoping, portal styling, forced-colors behavior, and packed-consumer
verification. Primitive state logic and token generation are owned by their
respective TDDs. Per-component CSS exports and Shadow DOM are outside v1.

## Technical Context

The baseline combines Sass and Panda, but JS import does not prove CSS delivery;
theme bundles may omit component rules; some rules sit outside declared layers;
and global `:root`/reset selectors can leak across co-located brands/remotes.

| ID      | Contract                                                                                                                     |
| :------ | :--------------------------------------------------------------------------------------------------------------------------- |
| STY-001 | Every styled component composes a public primitive and adds no independent behavior state machine.                           |
| STY-002 | Stable declarations consume Tier-2 tokens or justified Tier-3 aliases; raw-value exceptions are linted.                      |
| STY-003 | One aggregate component asset and one instance of each selected theme asset are loaded by the composition root exactly once. |
| STY-004 | Component JS has no CSS side-effect import; remotes never inject UI Platform CSS.                                            |
| STY-005 | All public rules participate in the canonical layer order and remain under an allowed scope.                                 |
| STY-006 | Portaled UI remains inside the originating theme root.                                                                       |
| STY-007 | Dual Sass/Panda ownership continues only if correctness, security, accessibility, and approved scenario budgets pass.        |

## Component Design

```mermaid
graph LR
  P[core-ui primitive] --> W[system styled wrapper]
  T[generated token contract] --> S[Sass component compiler]
  T --> R[Frozen Panda recipes]
  S --> C[Aggregate component CSS]
  R --> C
  TH[Theme variable CSS] --> ROOT[Consumer composition root]
  C --> ROOT
  W --> ROOT
```

| Module                | Owns                                                                  | Prohibited                                           |
| :-------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------- |
| styled wrapper        | visual variant props, primitive composition, stable parts/state hooks | duplicating focus/keyboard/state logic               |
| Sass component source | skinned component declarations                                        | global unlayered reset or raw Tier-1 consumption     |
| Panda adapter         | existing structural recipes only during P0                            | expanding recipe surface before dual-engine decision |
| CSS assembler         | deterministic layers and asset order                                  | source-order dependence outside layers               |
| consumer root         | importing component/theme assets once                                 | remote/component-level reinjection                   |

Canonical layer order is `reset, tokens, base, components, recipes, utilities,
overrides`. Layers determine priority;
`[data-scnx-theme][data-scnx-resolved-mode]` and component roots provide
isolation.

## Data Model

```ts
type StyledComponentRecord = {
  publicEntry: string;
  primitiveEntry: string;
  rootPart: string;
  parts: string[];
  states: string[];
  variants: Record<string, string[]>;
  tokenReferences: string[];
  tier3Aliases: Array<{ token: string; justification: string }>;
  cssOwner: "sass" | "panda";
  cssArtifact: "styles/components.css";
  themeCoverage: string[];
  stability: "candidate" | "stable";
};
```

The generated style manifest maps every stable component/part/state/variant to
its owner and artifact. Duplicate ownership of the same public selector/property
pair is rejected unless an explicit layer-ordered override is recorded.

## API / Interface

Public styling consists of:

- documented component props and visual variants;
- stable `data-part`, `data-state`, and accessibility-derived selectors;
- `[data-scnx-theme="<theme-id>"][data-scnx-resolved-mode="<mode>"]` roots;
- `@scnx/system/styles/components.css`;
- `@scnx/system/tokens/css/<theme-id>.css`; and
- documented token variables.

Private Sass class structure and generated Panda class names are not public.
Consumers may override through the final `overrides` layer and documented
tokens/parts only. A single-brand `:root` compatibility asset, which
ADR-UIP-PLT-001 permits, is not shipped in v1; a single-brand document passes
`root={document.documentElement}` to `ThemeProvider` instead, which puts the
theme attributes on `html`.

## Algorithms / Logic

### Compile and assemble

1. Load the validated normalized token contract.
2. Compile Sass components into the `components` layer.
3. Build only the frozen Panda recipe inventory into the `recipes` layer.
4. Parse both outputs and reject undeclared layers, selectors outside allowed
   scopes, undefined variables, raw-value violations, and duplicate ownership.
5. Assemble deterministic aggregate CSS in canonical layer order.
6. Pack CSS independently from JavaScript.
7. Install tarballs and import component plus selected theme CSS once at the
   composition root.
8. Render the supported set and assert computed properties and isolation.

#### Decision record: governed values in component CSS

STD-GLB-FE-005 section 3.2: "Governed shared decisions for color, typography,
spacing rhythm, radius, shadow, z-index, and motion use Tier-2 semantic tokens
or justified Tier-3 aliases", while "local geometry with no reusable semantic
role" stays valid and "records its purpose when the reason is not
self-evident". On 2026-10-21 the stylesheet gate (step 4) enforced only color,
`z-index`, custom properties, and `!important`; twelve motion declarations and
one radius in Accordion, CodeShowcase, and CodeSelect used literals (GV1–GV3),
and spacing and typography were not checked at all (GV4–GV7).

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Source                                                              | Tradeoff                                                                                                                                                                                                                                                          |
| :-- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GV1 | The gate rejects a motion literal, meaning a duration, a timing keyword, or a timing function in a `transition` or `animation` property, and a non-zero length in a border radius, unless `styles.config.json` records an exception with its standard, reason, and removal condition. Zero durations and percentages are geometry and pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | STD-GLB-FE-005 3.2                                                  | The rule reads the built CSS, so a literal hidden behind a Sass variable that resolves to a literal is still caught.                                                                                                                                              |
| GV2 | A duration inside a `calc()` that multiplies a documented runtime property is a stagger step, a local value whose purpose the runtime property's entry records (`--item-index`, `--ancestors-index`: the Sidebar's 33 ms step).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | STD-GLB-FE-005 3.2 ("local geometry"; "records its purpose")        | The step is not a token, because it has no reusable semantic role; a second component that staggers would make it one.                                                                                                                                            |
| GV3 | Each literal maps to the motion action the STD defines for it: height and opacity of expanding content and the rotating chevron of a disclosure use `motion.disclosure` ("Height expand/collapse for accordions, menus, and detail triggers"); hover, focus, and selection color, shadow, and indicator changes use `motion.feedback` ("State feedback on the same element"). `transition: all` becomes the properties that change. The scrollbar thumb radius uses `dimension.radius.element`.                                                                                                                                                                                                                                                                                                                    | STD-UIP-TKN-001, "Semantic Motion Language"                         | Feedback becomes 150 ms instead of 200 ms, and the Accordion chevron takes the disclosure curve instead of `cubic-bezier(0.16, 1, 0.3, 1)`; the thumb radius becomes 0.25rem instead of 3px. Static snapshots do not change, except possibly the scrollbar thumb. |
| GV4 | The gate also rejects a non-zero length in a spacing or positioning property (`padding*`, `margin*`, `inset*`, `gap`, `row-gap`, `column-gap`, `top`, `right`, `bottom`, `left`) and a non-zero length or number in `font-size`, `line-height`, `letter-spacing`, or `font-weight`, unless a recorded exception allows it. On 2026-10-21 it found 39 such literals, including the reference slice (Button, TextField, Tabs), not the 17 an earlier search had counted.                                                                                                                                                                                                                                                                                                                                             | STD-GLB-FE-005 3.2; STD-UIP-STY-001 2.1.0, "Governed values"        | Percentages, keywords, zero, and `var()` pass, so a value computed from tokens (for example `calc()` with a token) is not reported.                                                                                                                               |
| GV5 | Each literal maps by STD-UIP-STY-001's rule, the relationship first and then the nearest step, a tie taking the smaller step: Button padding `0.6rem 1.25rem` becomes inset compact and inset default; TextField `0.55rem 0.75rem` and CodeSelect `4px 10px` become inset compact; Tabs `0.55rem 0.9rem` becomes inset compact and inset default; Accordion's and the Sidebar header's `1.25rem` become inset default; FloatingLayout's region gap becomes `section` and its gutter and sticky offset become `page`; the CodeShowcase gaps and insets take inline, stack, and inset steps, and its navigation text takes the `label.default` role; the navigation group header's extra `0.05em` tracking is removed in favor of `label.small`'s; the code block's `0.925em` is removed in favor of `code.default`. | STD-UIP-STY-001 2.1.0, "Governed values"                            | A visual change, reviewed in Chromatic: for example Button becomes 35.5 px tall instead of 38.7, Tabs 35.5 instead of 37.1, TextField 42 instead of 43.6, and the FloatingLayout gap 2rem instead of 1.25rem.                                                     |
| GV6 | Eleven literals stay as recorded local geometry in `styles.config.json`, each with its purpose and removal condition: the EdgeLayout sticky offset (navbar height), the CodeSelect value's right clearance and the chevron glyph size, the Sidebar toggle's overhang, inline code's text-relative inset and size, the list-marker gutters, the CodeShowcase language-icon glyph size, and `line-height: 1` on the navigation icon and badge boxes.                                                                                                                                                                                                                                                                                                                                                                 | STD-UIP-STY-001 2.1.0 ("Record local geometry"); STD-GLB-FE-005 3.2 | Each is a candidate token if a second component needs the same geometry.                                                                                                                                                                                          |
| GV7 | The packed component fixture rejects a focusable part whose pointer target is below 24 by 24 CSS pixels (for CodeSelect, its wrapper). Before this change the TableOfContents link (21 px) and the CodeShowcase trigger (21 px) were below it; both get `min-block-size: 24px`, the trigger through a new class `scnx-code-showcase__trigger`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | WCAG 2.2 SC 2.5.8 (STD-UIP-STY-001 [9])                             | 24 px is the criterion's own minimum, not a design value, so it is a literal outside the governed spacing properties. A larger padding would have met it too, but would have made each TableOfContents row 37 px tall.                                            |

### Portal and scope resolution

Overlay components receive a portal container from the active theme provider,
except a native `dialog` shown with `showModal()`, which stays inside the theme
root and renders in the top layer (TDD primitives P16).
The container is a descendant of the originating theme root. If no valid portal
container exists, a portal-dependent component fails with a development
diagnostic and remains outside Stable support; it does not silently mount under
unscoped `document.body`.

### Dual-engine eligibility

Measure both engines in the same packed scenario. If both pass all mandatory
gates and the approved scenario budgets, retain the bounded split. If one fails,
consolidate on the eligible engine through an ADR/TDD revision. If neither
passes, block Stable promotion. Measurements do not create universal policy.

## Configuration

The versioned style manifest declares stable components, CSS owner, public
parts/states, theme coverage, aggregate entry, canonical layers, allowed root
selectors, raw-value allowlist, and frozen Panda recipes. Configuration is build
input, validated against actual source and output, and cannot vary by runtime
environment.

## Failure Handling

| Failure                                   | Response                                                     |
| :---------------------------------------- | :----------------------------------------------------------- |
| Missing CSS for stable component/state    | Block package pair                                           |
| Undefined token or invalid computed value | Block affected theme/component                               |
| Undeclared/global selector leak           | Reject output before packing                                 |
| Duplicate stylesheet instance             | Fail consumer fixture; root/remote loading must be corrected |
| Portal outside theme root                 | Fail component scenario; no global fallback                  |
| Forced-colors focus loss                  | Block affected focusable component                           |
| Dual-engine budget/correctness failure    | Execute documented consolidation branch                      |

## Observability

The CSS report records source/artifact digests, rule/declaration counts by
layer and owner, undefined variables, raw-value exceptions, duplicate selector
pairs, asset bytes by encoding, computed-style failures, stylesheet instance
counts, and portal/scope failures. Visual diffs are retained as evidence but do
not replace computed-style and behavior assertions.

## Testing Strategy

- Static: token usage, allowed selectors, layer membership, ownership, raw-value
  exceptions, output parse, deterministic order.
- Unit: wrapper prop consumption, primitive delegation, variant/state-to-hook
  mapping, absence of behavior duplication.
- Packed browser: supported component/state matrix under every theme/mode,
  aggregate/theme path resolution, tree shaking, no JS CSS side effect.
- Isolation: two differently themed roots, nested root, portal, host plus two
  remotes in both load orders, and consumer override layer.
- Accessibility: visible `:focus-visible` outline, forced colors, contrast,
  reduced motion, disabled and selected states.
- Visual: stable reference scenarios across declared browsers and densities.
- Workshop (ADR-UIP-WKS-001): every supported component has Storybook stories
  for its documented variants and states. The preview loads the built
  `styles/components.css` and `tokens/css/<theme-id>.css`, never Sass or Panda
  source, and wraps each story in the ThemeProvider with a control for every
  theme ID and mode. Each story runs as a Vitest browser-mode test in Chromium
  with axe-core at `a11y.test: "error"`; a story downgraded to the warning
  level records the reason and its owner. Chromatic compares every story on each push and blocks merge on
  an unreviewed visual change.
- Negative: missing theme asset, duplicate component asset, global reset,
  unlayered rule, invalid variable, unauthorized Tier-1 value.

## Performance Notes

Measure aggregate and theme CSS bytes, unused declarations for the reference
slice, style recalculation, generated variant count, build duration, and
incremental consumer impact. Each result records browser, device/runner, build
mode, tool, baseline, and encoding. There is no universal 10% or 2x rule.

## Security Notes

Style generation is build-time and performs no runtime evaluation. Strict CSP
requires no `unsafe-inline`; static stylesheet loading follows consumer policy.
CSS input is repository-owned, and any future external theme input must be
validated as data rather than interpolated into selectors/declarations.

## Operational Notes

Runbooks cover missing styling, token resolution, leakage, duplicate assets,
visual regression, and rollback. A public selector/token/asset change requires
compatibility classification, migration notes, and a new immutable version.

## Rollout and Compatibility

First generate the style manifest from the current inventory, close all missing
and duplicate ownership, introduce canonical layers/scopes, assemble the
aggregate asset, and prove packed consumers. Then run the dual-engine decision
gate before Stable promotion. Baseline private class names receive no aliases;
documented parts and assets become the v1 compatibility boundary.

The baseline Sidebar read ten undocumented custom properties. STD-GLB-FE-005
section 3.2 prohibits them ("Custom properties in shared and application styles
are either `--ds-*` tokens or documented Tier-3 aliases; ad-hoc custom properties
are prohibited"), the style gate enforces it, and they were removed: `--sidebar-width`,
`--layout-sidebar-width`, `--sidebar-bg-color`, `--sidebar-group-header-color`,
`--sidebar-item-color`, `--sidebar-item-hover-bg`, `--sidebar-item-hover-color`,
`--sidebar-item-active-bg`, `--sidebar-item-active-color`, and
`--sidebar-item-active-weight`. They receive no aliases, like the private class
names. A consumer that set them overrides the Sidebar through the `overrides`
layer or a Tier-3 alias (STD-UIP-TKN-001, "Tier-3 Alias Governance"), and the
migration evidence of a pilot (PLAN P3) lists any such use.

## Open Questions

- Does the dual-engine gate retain both Sass and Panda after the reference slice?
- Which components, if any, need per-component CSS in a future major version?
- Is the single-brand `:root` compatibility asset required by a named consumer?

## Traceability

Architecture authority: SAD-003; ADR-GLB-FE-013, ADR-UIP-PLT-001, and
proposed ADR-UIP-WKS-001;
STD-GLB-FE-003/005/008/009 and STD-UIP-STY-001/ENG-001. Lifecycle status in
`scnehaux-architecture` controls authority. Execution:
[PLAN](../../PLAN.md) P0 rows 5, 9–11 and the component workshop. Related designs: tokens, theme runtime,
primitives, and packaging.
