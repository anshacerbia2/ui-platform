# Principal review — Package documentation retirement

Status: **audit record; non-normative**.

## Scope

The topology rule allows Markdown only as the root navigation README, PLAN,
ROADMAP, the five TDDs, review records, and one navigation-only README per
package. Thirty-two Markdown files under `packages/` fell outside that rule:
package guides, component READMEs, design notes, session plans, and token notes.
They are removed; git history keeps their text.

Before removal, each file was compared with the five TDDs, PLAN, ROADMAP, and
the central standards and ADRs. None needed to be kept whole. Most content is
superseded, non-normative, or contradicts a governing document. Ten rules had
no governing home. They are listed below as candidate TDD amendments. This
record does not amend any TDD; each candidate needs principal disposition and
ratification like any other TDD change.

## Package documentation review disposition

| ID  | Candidate rule (source file)                                                                                                                                                                                                                        | Proposed home                               | Disposition |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :---------- |
| D1  | Package source uses relative imports; path aliases are limited to tests (core-ui `CONTRIBUTING.md`).                                                                                                                                                | Packaging TDD                               | Open        |
| D2  | Internal modules never import through a package barrel (core-ui `TREE_SHAKING_GUIDE.md`).                                                                                                                                                          | Packaging TDD                               | Open        |
| D3  | A late subscriber to the disclosure registry receives the current state on subscription (disclosure-base `README.md`).                                                                                                                             | Primitives TDD, registry                    | Open        |
| D4  | `DisclosureProvider` `type` defaults to `"multiple"`; the TDD leaves `type` and `collapsible` defaults unspecified (disclosure-base `README.md`).                                                                                                   | Primitives TDD, API                         | Open        |
| D5  | Navigation: an active item sets `aria-current="page"`; `aria-expanded` appears only on items with children; items sit inside a group; `data-level`, `data-index`, and `--item-index` are styling hooks; arrow-key roving is consumer-owned (navigation-base `README.md`). | Primitives behavior matrix; styled TDD hooks | Open        |
| D6  | After opening, height returns to `auto` so content can resize; empty content (`scrollHeight` 0) settles immediately; `data-mounted` marks mounting (transition-base `README.md`, `RICH_ARCHITECTURE.md`).                                           | Theme TDD, transition FSM                   | Open        |
| D7  | Sidebar flyout: clicking a level-0 item while collapsed opens it; a branch click keeps it open; a leaf or outside click closes it. Groups containing the active item start expanded without transition. Collapsed top-level items require an icon and an accessible name (sidebar `README.md`). | Primitives sidebar behavior matrix           | Open        |
| D8  | Hover, pressed, and selected surfaces are alpha overlays so they remain visible on every elevation; Tier-3 aliases compile in component stylesheets, not the global contract (`semantic-bg-token.md`).                                           | Tokens TDD, restated in the canonical grammar | Open        |
| D9  | Tier-1 lightness is monotonic within each mode (design-system `PLAN.md`, story 2.2). The former 88% saturation cap belonged to the HSL generator and conflicts with ADR-UIP-TKN-002 (OKLCH); it is not a candidate.                              | Tokens TDD                                  | Open        |
| D10 | Click-outside: a null handler removes listeners; a click inside any ref in the array is ignored; the hook never stops propagation (use-on-click-outside `README.md`).                                                                                | Primitives TDD, hooks                       | Open        |

## Contradictions removed with the files

The removed files also stated rules that governing documents replace. They are
recorded so the removal is not mistaken for a loss of authority:

- packaging: wildcard subpath exports, ESM and CJS by default, hook-name
  inference for `"use client"`, `workspace:*` links, Node 18 and pnpm 9,
  unmeasured bundle-size and frame-time claims (packaging TDD; PLAN
  measurement rules; STD-UIP-ENG-001);
- testing: Vitest `retry: 1` (PLAN P0 row 2 requires `retry: 0`);
- primitives: public registry mutation APIs, `isOpen` held true until the close
  animation ends, one-time `isExpanded` seeding, `[key: string]: any` props,
  `as` preferred over `asChild`, silent rendering of invalid children, focus
  traps on non-modal dropdowns (primitives TDD; STD-UIP-PRM-001);
- theme and transitions: `smoothClose`, `fadein`/`fadeout` states, the
  grid-rows technique, a 1 ms tick, reliance on `transitionend` alone,
  `data-interrupted` as a styling input, flyouts portaled to `document.body`
  (theme TDD; styled TDD);
- styling and tokens: a sidebar state machine inside `@scnx/system`, consumer
  Panda live scanning, `family.role.variant` and `bg-*` token names, a "Dim"
  mode, and Tier-3 aliases gated on cross-product reuse (styled and tokens
  TDDs; STD-UIP-TKN-001; ADR-UIP-TKN-002).

## Follow-up

Principals dispose D1–D10. Accepted candidates enter the named TDD through a
ratified revision; the behavior items (D3–D7, D10) also become assertions in the
PLAN P0 row 6 and row 7 test matrices. The documentation gate now rejects
tracked Markdown outside the topology and package READMEs with sections or
commands.
