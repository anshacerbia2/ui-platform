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

| Gate                           | Scenario and expected behavior                                                                                                                          | Result / evidence |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Types and dependency direction | Both packages; no `core-ui → system` import                                                                                                             |                   |
| State/interaction              | OFSM, disclosure, TOC, navigation, keyboard/focus matrix                                                                                                |                   |
| Static analysis                | Debug logs, prohibited token bypass, unsafe-eval                                                                                                        |                   |
| Component ACR                  | Applicable WCAG 2.2/APG checks per state using the [Component ACR guide](../07-guides/GD-ui-platform-004-component-accessibility-conformance-report.md) |                   |

## Packed artifact evidence

| Gate                | Scenario and expected behavior                                                                              | Result / evidence |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------- |
| Install and exports | Isolated `pnpm pack` consumer, no source aliases; packed manifests contain no `workspace:` ranges           |                   |
| Types and CSS       | Every documented JS/type/CSS/Sass/font/token subpath resolves; supported components are styled              |                   |
| Tokens/themes       | Parser plus computed properties for every theme/scope/state; unresolved variables fail                      |                   |
| Fonts/assets        | Requested font loads; declared CSS variables resolve                                                        |                   |
| SSR/RSC             | Next App Router client boundary; no server import crash                                                     |                   |
| CSP/provider        | Strict CSP, no `unsafe-eval`; two providers coexist                                                         |                   |
| Federation          | Packed host plus two remotes; singleton identity, manifest-derived version policy, lazy remotes             |                   |
| CSS ownership       | Exactly one aggregate component stylesheet hash and one selected theme asset; portal retains its theme root |                   |

## Product integration evidence

- Viewport × theme × state coverage:
- Full-page WCAG 2.2 AA evaluation and known product responsibilities:
- CSS/JS size, layout work, build time, and thresholds by scenario:
- Visual regression and locale/direction coverage:
- Exceptions, owner, expiry, migration path:
- Release decision and approving authority:
