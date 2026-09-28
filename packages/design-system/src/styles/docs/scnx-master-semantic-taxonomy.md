# SCNX Master Semantic Taxonomy

## Enterprise-Grade Design Token Architecture (10/10 Principal Standard)

> Scope: Comprehensive semantic taxonomy for all design token families in `@scnx/system`, intended as the architectural foundation for a top-tier enterprise design system (FAANG-grade).
>
> Coverage includes all major token families: color, typography, spacing, sizing, radius, border, shadow, motion, opacity, z-index/layer, and component semantic strategy.

---

# 1. Architectural Principle

All tokens are modeled in a strict 3-tier system:

```text
Tier-1: Primitive (raw values)
Tier-2: Semantic (global meaning)
Tier-3: Component aliases (optional, only when unique)
```

Rules:

* Tier-1 = no semantic meaning
* Tier-2 = single source of truth
* Tier-3 = only for component-unique behavior
* Never put component names in Tier-2
* Semantic names must be platform-agnostic

---

# 2. Master Semantic Families

Full token families for enterprise systems:

## Color families

* surface
* state
* feedback
* overlay
* brand
* utility
* layer
* text
* border
* icon
* ring
* shadow
* chart

## Dimension families

* spacing
* size
* radius
* stroke
* opacity
* z

## Typography families

* font-family
* font-size
* font-weight
* line-height
* letter-spacing

## Motion families

* duration
* easing
* transition
* animation

---

# 3. Full Semantic Taxonomy

## 3.1 Color Semantic Domains (with purpose)

| Family   | Purpose                       | Typical usage                |
| -------- | ----------------------------- | ---------------------------- |
| surface  | Structural UI planes          | page, cards, panels, drawers |
| state    | Interactive visual states     | hover, selected, disabled    |
| feedback | Semantic status communication | alert, badge, toast          |
| overlay  | Global visual effects         | scrim, glass, backdrop       |
| brand    | Brand identity surfaces       | CTA, brand sections          |
| utility  | Special-purpose helper fills  | skeleton, highlight          |
| layer    | Elevation abstraction         | z-plane orchestration        |
| text     | Semantic text colors          | primary, secondary, danger   |
| border   | Semantic strokes              | divider, focus, error        |
| icon     | Semantic icon colors          | nav, actions, status         |
| ring     | Focus accessibility rings     | keyboard focus               |
| shadow   | Depth tokens                  | card, modal, floating        |
| chart    | Data visualization palette    | dashboards, reports          |

## 3.2 Surface Tokens

| Token               | Purpose                   |
| ------------------- | ------------------------- |
| surface.canvas      | Root viewport background  |
| surface.default     | Primary container surface |
| surface.subtle      | Secondary soft surface    |
| surface.muted       | Less emphasized section   |
| surface.sunken      | Inset/well/editor area    |
| surface.raised      | Elevated card/panel       |
| surface.floating    | Popover/tooltip plane     |
| surface.overlay     | Modal content plane       |
| surface.translucent | Blur/glass surface        |
| surface.inverse     | Inverted dark surface     |

## 3.3 State Tokens

| Token               | Purpose                     |
| ------------------- | --------------------------- |
| state.hover         | Pointer hover state         |
| state.pressed       | Active press state          |
| state.selected      | Selected entity             |
| state.current       | Current location/navigation |
| state.checked       | Checked boolean state       |
| state.open          | Open disclosure/menu        |
| state.dragging      | Drag source                 |
| state.drop-target   | Drag destination            |
| state.disabled      | Disabled interaction        |
| state.readonly      | Readonly region             |
| state.loading       | Loading active region       |
| state.pending       | Waiting async operation     |
| state.focus-visible | Keyboard focus state        |

## 3.4 Feedback Tokens

| Pattern            | Purpose                      |
| ------------------ | ---------------------------- |
| feedback.info.*    | informational status         |
| feedback.success.* | success state                |
| feedback.warning.* | warning state                |
| feedback.danger.*  | destructive/error state      |
| feedback.neutral.* | neutral semantic status      |
| feedback.accent.*  | promotional/highlight status |

Emphasis scale:

| Emphasis | Purpose          |
| -------- | ---------------- |
| subtle   | light tint       |
| muted    | medium soft fill |
| default  | standard fill    |
| strong   | highest emphasis |

## 3.5 Overlay Tokens

| Token               | Purpose                |
| ------------------- | ---------------------- |
| overlay.scrim       | dark modal backdrop    |
| overlay.scrim-light | light image overlay    |
| overlay.glass       | translucent blur       |
| overlay.glass-dark  | dark blur              |
| overlay.backdrop    | generic overlay filter |

## 3.6 Brand Tokens

| Token           | Purpose              |
| --------------- | -------------------- |
| brand.primary   | primary brand fill   |
| brand.secondary | secondary brand fill |
| brand.subtle    | subtle brand area    |
| brand.inverse   | inverted brand fill  |

## 3.7 Utility Tokens

| Token                    | Purpose                |
| ------------------------ | ---------------------- |
| utility.skeleton         | loading placeholder    |
| utility.skeleton-shimmer | skeleton animation     |
| utility.highlight        | text/content highlight |
| utility.selection        | selected region        |
| utility.mask             | temporary blocked area |
| utility.placeholder      | empty preview          |
| utility.debug            | internal dev/debug     |

## 3.8 Layer Tokens

| Token          | Purpose                   |
| -------------- | ------------------------- |
| layer.base     | normal page layer         |
| layer.raised   | elevated card             |
| layer.sticky   | sticky headers            |
| layer.dropdown | dropdown menus            |
| layer.popover  | floating contextual panel |
| layer.toast    | notification layer        |
| layer.tooltip  | tooltip layer             |
| layer.overlay  | drawer layer              |
| layer.modal    | modal dialog              |
| layer.scrim    | backdrop plane            |
| layer.max      | emergency top-most        |

## 3.9 Text Tokens

| Token            | Purpose               |
| ---------------- | --------------------- |
| text.primary     | primary readable text |
| text.secondary   | secondary text        |
| text.tertiary    | muted supporting text |
| text.disabled    | disabled text         |
| text.inverse     | text on dark bg       |
| text.placeholder | placeholder           |
| text.link        | anchor text           |
| text.link-hover  | hovered anchor        |
| text.success     | success text          |
| text.warning     | warning text          |
| text.danger      | error text            |

## 3.10 Border Tokens

| Token           | Purpose             |
| --------------- | ------------------- |
| border.default  | standard border     |
| border.subtle   | low-emphasis border |
| border.strong   | emphasized border   |
| border.inverse  | border on dark bg   |
| border.focus    | accessibility focus |
| border.disabled | disabled border     |
| border.success  | success border      |
| border.warning  | warning border      |
| border.danger   | error border        |

## 3.11 Icon Tokens

| Token          | Purpose          |
| -------------- | ---------------- |
| icon.primary   | primary icons    |
| icon.secondary | supporting icons |
| icon.tertiary  | muted icons      |
| icon.disabled  | disabled icons   |
| icon.inverse   | icon on dark bg  |
| icon.brand     | brand icon       |
| icon.success   | status success   |
| icon.warning   | status warning   |
| icon.danger    | status danger    |

## 3.12 Ring Tokens

| Token            | Purpose             |
| ---------------- | ------------------- |
| ring.focus       | focus ring          |
| ring.focus-inset | inset focus ring    |
| ring.error       | error ring          |
| ring.drag        | drag highlight ring |

## 3.13 Shadow Tokens

| Token          | Purpose            |
| -------------- | ------------------ |
| shadow.low     | subtle depth       |
| shadow.medium  | standard elevation |
| shadow.high    | strong elevation   |
| shadow.overlay | modal shadow       |
| shadow.focus   | focus shadow       |

## 3.14 Chart Tokens

| Token               | Purpose                 |
| ------------------- | ----------------------- |
| chart.categorical.* | categorical data series |
| chart.sequential.*  | sequential data         |
| chart.diverging.*   | diverging values        |
| chart.threshold.*   | threshold markers       |

---

# 4. Dimension Semantic Families

## Spacing

* spacing.3xs
* spacing.2xs
* spacing.xs
* spacing.sm
* spacing.md
* spacing.lg
* spacing.xl
* spacing.2xl
* spacing.3xl
* spacing.4xl

## Size

* size.control-xs
* size.control-sm
* size.control-md
* size.control-lg
* size.control-xl
* size.icon-xs
* size.icon-sm
* size.icon-md
* size.icon-lg
* size.avatar-xs
* size.avatar-sm
* size.avatar-md
* size.avatar-lg

## Radius

* radius.none
* radius.sm
* radius.md
* radius.lg
* radius.xl
* radius.2xl
* radius.full

## Stroke

* stroke.none
* stroke.hairline
* stroke.thin
* stroke.default
* stroke.medium
* stroke.thick

## Opacity

* opacity.disabled
* opacity.subtle
* opacity.muted
* opacity.overlay
* opacity.scrim

## Z

* z.base
* z.sticky
* z.dropdown
* z.popover
* z.toast
* z.tooltip
* z.overlay
* z.modal
* z.max

---

# 5. Typography Semantic Families

## Font family

* font-family.base
* font-family.heading
* font-family.mono
* font-family.brand

## Font size

* font-size.xs
* font-size.sm
* font-size.md
* font-size.lg
* font-size.xl
* font-size.2xl
* font-size.3xl
* font-size.4xl

## Font weight

* font-weight.regular
* font-weight.medium
* font-weight.semibold
* font-weight.bold

## Line height

* line-height.tight
* line-height.normal
* line-height.relaxed

## Letter spacing

* letter-spacing.tight
* letter-spacing.normal
* letter-spacing.wide

---

# 6. Motion Semantic Families

## Duration

* duration.instant
* duration.fast
* duration.normal
* duration.slow
* duration.slower

## Easing

* easing.standard
* easing.enter
* easing.exit
* easing.emphasized

## Transition

* transition.hover
* transition.focus
* transition.expand
* transition.modal
* transition.toast

---

# 7. Component Token Policy

Tier-3 component tokens only allowed if:

1. unique semantic behavior
2. may diverge independently
3. reused across products

Otherwise:

Component must consume Tier-2 directly.

Example:

GOOD:

* input caret color unique
* table sticky shadow unique

BAD:

* bg-button = alias to surface.default only
* bg-table-row = alias to surface.default only

---

# 8. Recommended SCNX Implementation

Folder strategy:

```text
packages/design-system/tokens/
  primitives/
  semantic/
    color/
    spacing/
    typography/
    motion/
  components/
```

Suggested semantic JSON split:

```text
semantic/
  color.json
  text.json
  border.json
  icon.json
  spacing.json
  radius.json
  shadow.json
  motion.json
```

---

# 9. Final Recommendation

SCNX should standardize semantic naming pattern:

```text
family.role.variant
```

Examples:

* surface.default
* state.hover
* feedback.success.subtle
* text.primary
* border.focus
* shadow.medium
* spacing.md
* radius.lg
* duration.fast

This provides:

* platform agnostic semantics
* scalable theming
* white-label ready
* future mobile compatibility
* enterprise maintainability
* strict OCP
* excellent Style Dictionary compatibility
