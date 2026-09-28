# Release conformance record template

Copy this template for each candidate release. Link CI runs, tarball checksums, browser traces, and reviewed exceptions. Do not mark a check as passing from a source build when its claim concerns published output.

## Identity

- Version / commit / package tarball checksums:
- React, Next, Vite/Rspack, browser, OS versions tested:
- Reviewer and date:
- Applicable accepted ADRs, active STD versions, and reviewed TDD revisions:
- Open/proposed decisions affecting this candidate and the resulting release restriction:
- Supported package subpaths, themes, component inventory:

## Source evidence

| Gate | Scenario and expected behavior | Result / evidence |
| --- | --- | --- |
| Types and dependency direction | Both packages; no `core-ui → system` import | |
| State/interaction | OFSM, disclosure, TOC, navigation, keyboard/focus matrix | |
| Static analysis | Debug logs, prohibited token bypass, unsafe-eval | |
| A11y component report | Applicable APG/WCAG checks per state | |

## Packed artifact evidence

| Gate | Scenario and expected behavior | Result / evidence |
| --- | --- | --- |
| Install and exports | Isolated `npm pack` consumer, no source aliases | |
| Types and CSS | Every documented subpath resolves; Button is styled | |
| Tokens/themes | Parser plus computed styles, each theme/scope/state | |
| Fonts/assets | Requested font loads; declared CSS variables resolve | |
| SSR/RSC | Next App Router client boundary; no server import crash | |
| CSP/provider | Strict CSP, no `unsafe-eval`; two providers coexist | |
| Federation | Shell/remote React and context identity, version policy | |

## Product integration evidence

- Viewport × theme × state coverage:
- Full-page WCAG 2.2 AA evaluation and known product responsibilities:
- CSS/JS size, layout work, build time, and thresholds by scenario:
- Visual regression and locale/direction coverage:
- Exceptions, owner, expiry, migration path:
- Release decision and approving authority:
