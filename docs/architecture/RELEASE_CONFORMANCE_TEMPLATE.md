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
| State/interaction              | Transition engine (completion, timeout fallback, interruption, reduced motion), disclosure, TOC, navigation, keyboard/focus matrix                      |                   |
| Static analysis                | Debug logs, prohibited token bypass, unsafe evaluation, Vitest `retry: 0`                                                                               |                   |
| Dependency security            | Lockfile-resolved graph or SBOM audit, `react-server-dom-*`, framework advisories; zero high or critical findings                                       |                   |
| Component ACR                  | Applicable WCAG 2.2/APG checks per state using the [Component ACR guide](../07-guides/GD-ui-platform-004-component-accessibility-conformance-report.md) |                   |

## Packed artifact evidence

| Gate                | Scenario and expected behavior                                                                                                                                                             | Result / evidence |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Install and exports | Isolated `pnpm pack` consumer, no source aliases; packed manifests contain no `workspace:` ranges; no wildcard exports; identical React peer ranges proven at both ends                    |                   |
| Types and CSS       | Every documented JS/type/CSS/Sass/font/token subpath resolves; supported components are styled                                                                                             |                   |
| Tokens/themes       | Grammar parse of every emitted name; identical Tier-2 key set per theme; zero unresolved variables; computed values valid; SC 1.4.3 and SC 1.4.11 pairs pass                               |                   |
| Fonts/assets        | Requested font loads; declared CSS variables resolve                                                                                                                                       |                   |
| SSR/RSC             | Next App Router client boundary; no server import crash                                                                                                                                    |                   |
| CSP/provider        | `script-src` and `style-src` without `unsafe-eval` or `unsafe-inline`; consumer nonce or hash; zero violation reports; two providers coexist                                               |                   |
| Import side effects | Import-only test of every public entry: no DOM mutation, global assignment, network request, or stylesheet insertion                                                                       |                   |
| Focus/forced colors | Visible `:focus-visible` outline on every focusable supported component in forced-colors mode                                                                                              |                   |
| Federation          | Packed host plus two remotes; singleton identity for React, React DOM, and `@scnx/core-ui`; consumer-range `requiredVersion`; lazy remotes; controlled failure for an incompatible version |                   |
| CSS ownership       | Exactly one aggregate component stylesheet hash and one instance of each selected theme asset; portal retains its theme root                                                               |                   |

## Product integration evidence

- Viewport × theme × state coverage:
- Full-page WCAG 2.2 AA evaluation (product, pages in scope, evaluator, date, result, open issues):
- CSS/JS size, layout work, and build time per named scenario, with baseline, threshold, and pass/fail:
- Visual regression and locale/direction coverage:
- Exceptions, owner, expiry, migration path:
- Release decision and approving authority:
