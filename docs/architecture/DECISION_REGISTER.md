# Decision register

These choices are **open**. No principal is being asked to ratify an implementation by reading this file. Close each item with a canonical ADR or approved design note, evidence, owner, and migration impact.

| Decision | Options to compare | Evidence before decision | Current position |
| --- | --- | --- | --- |
| React Aria scope | Native/custom behavior; selected hooks; broader adoption | APG behavior matrix, accessibility defect rate, bundle/runtime cost, API escape hatches, vendor license/provenance | Open; behavior contract is mandatory, vendor is not |
| Multi-brand in one DOM | Scoped theme roots; Shadow DOM where justified; constrained global theme | Two brands rendered together, portals/overlays, SSR/hydration, CSS leakage, provider updates | Open; one global `:root` theme is insufficient |
| Styling engine ownership | Keep Sass + Panda with one token source; reduce Panda; consolidate later | CSS size per import, unresolved `--ds-*`, `staticCss: ["*"]` cost, override conflicts, build time | Measure during P0; no engine removal assumed |
| Public polymorphism | `as`; `asChild`; restricted combination; none per component | Ref/typing behavior, semantic markup, event merging, accessibility, consumer examples | Standardize after API test; no universal choice yet |
| Token physical package | Keep token source within `@scnx/system`; extract an independent package | Independent consumers, release/version coupling, circularity risk, migration cost | Keep two packages until evidence favors extraction |
| CSS delivery | Explicit shared stylesheet; component CSS subpaths; JS side-effect imports | Packed consumer render, tree shaking, documented import ergonomics, SSR behavior | Select one public contract in P0 |

Decision reviews must separate source-level proof from packed-package and application-level proof. Any new numeric budget must state the measured environment and scenario.

Until those decisions close, the implementation defaults in the [source-of-truth index](../ARCHITECTURE_SOT.md) constrain new work. An open design decision is not permission to claim the corresponding feature is supported.
