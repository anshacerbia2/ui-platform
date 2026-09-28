# UI Platform decision register

Status: **working decisions pending formal ratification**. This register is the single list of governed UI Platform choices. The same seven IDs appear in the architecture SOT, working consensus, PLAN, and roadmap. Owners are the roles defined in the [architecture SOT](../ARCHITECTURE_SOT.md#roles).

Each decision has two dates:

- **Decision recorded (2026-10-16):** the position, decision rule, and evidence plan are written into ADR-UIP-PLT-001 section 5 for ratification.
- **Evidence complete (P0 exit, 2026-11-27):** the evidence below has run in CI against packed artifacts or fixtures. A decision whose evidence fails keeps the affected capability outside stable exports.

## Decisions

### UIP-DEC-001 — Interaction foundation

- **Owner:** Interaction Lead. **Authority:** ADR-UIP-PLT-001 section 5.
- **Position:** native/custom behavior for Button, Disclosure/Accordion, Navigation, Sidebar, and layout primitives. Selected React Aria hooks behind the public API for Combobox, Select, Menu, Dialog, Popover, Listbox, and Tabs. React Aria types and props never appear in public APIs.
- **Alternatives:** all custom; broader React Aria Components adoption; another headless library.
- **Evidence:** a Combobox spike that replaces CodeSelect, built twice (custom and React Aria hooks), each run through:
  - the APG Combobox matrix;
  - manual checks with NVDA on Chrome and Firefox (Windows) and VoiceOver on Safari (macOS and iOS);
  - a license and provenance review;
  - a packed-consumer bundle comparison.
- **Decision rule:** an implementation that fails any required APG or screen-reader check is ineligible. If both are eligible, React Aria hooks are retained for the widget class unless their incremental gzip JavaScript cost in the packed Combobox scenario exceeds the custom implementation by more than 15 KB. If neither is eligible, the widget stays outside stable exports. The license must be compatible with the package license (React Aria is Apache-2.0).

### UIP-DEC-002 — Theme isolation

- **Owner:** Styling Lead. **Authority:** ADR-UIP-PLT-001 section 5.
- **Position:** public themes use `[data-scnx-theme="<theme-id>"]` roots. A separate `:root` compatibility stylesheet may serve a single-brand document and is excluded from multi-brand and federated claims. Resets are scoped. Shadow DOM is outside v1. Portals mount inside the originating theme container.
- **Alternatives:** document-wide `:root` theming; Shadow DOM isolation.
- **Evidence:** `fixtures/consumers/themes` renders two theme roots in one DOM with a modal, a tooltip, and a popover in each; `fixtures/consumers/next-app` repeats it with SSR and hydration.
- **Pass condition:** computed values inside each root match that root's theme, including inside its portals; no reset rule matches an element outside a theme root; hydration reports zero mismatches.

### UIP-DEC-003 — Styling ownership

- **Owner:** Styling Lead. **Authority:** ADR-UIP-PLT-001 section 5 and ADR-GLB-FE-013.
- **Position:** one versioned token source generates the Sass-facing and Panda-facing contracts. Panda is frozen to the recipes it already owns during P0. Sass component rules and Panda recipes live in the `components` and `recipes` layers.
- **Alternatives:** consolidate on Sass; consolidate on Panda; keep the bounded two-engine model.
- **Evidence (binary gates, from the first CI run):** zero unresolved `--ds-*` references; zero names outside the STD-UIP-TKN-001 grammar; zero UI Platform rules outside a declared layer.
- **Measurements for the exit review:** CSS size per import scenario, `staticCss: ["*"]` output versus recipes actually referenced, duplicate declarations, override test results, producer build time.
- **Decision rule at P0 exit:** consolidate onto Sass when Panda-owned recipes contribute less than 10% of emitted component CSS for the supported set, or when `staticCss` emits more than twice the recipe CSS actually referenced. Otherwise keep the bounded two-engine model with the frozen Panda surface.

### UIP-DEC-004 — Public polymorphism

- **Owner:** API Lead. **Authority:** ADR-UIP-PLT-001 section 5.
- **Position:** interactive parts expose `asChild` only at approved composition points. Typography and layout may expose a closed `as` tag union. A component never exposes both. Every other component keeps a fixed element.
- **Initial approved `asChild` points:** Button, Navigation item trigger, Table of contents link, Disclosure/Accordion trigger, and Dialog trigger. Adding a point requires an API test and an update to this list.
- **Alternatives:** `as` everywhere; `asChild` everywhere; no polymorphism.
- **Evidence:** ref and type tests, handler merge order, semantic output, disabled behavior, a router Link example, single-child failure, and Slot provenance and license evidence.

### UIP-DEC-005 — Token package boundary

- **Owner:** Release Lead. **Authority:** ADR-UIP-PLT-001 section 5.
- **Position:** tokens stay in `@scnx/system` for v1 and are published through explicit subpaths:
  - `@scnx/system/tokens/css/<theme-id>.css`: custom properties for one theme scope;
  - `@scnx/system/tokens/json/<theme-id>.json`: resolved Tier-2 values, generated;
  - `@scnx/system/tokens/scss`: Sass variables and maps for build-time consumers.
- **Alternatives:** extract an independent token package now.
- **Evidence (v1, P0):** every listed subpath resolves from the packed tarball; every emitted name passes the grammar gate; every public theme emits the identical Tier-2 key set.
- **Extraction trigger (not P0):** a non-React, native, Figma, or email consumer needs tokens without components, or tokens need an independent release cadence. Extraction then requires a migration design and a versioning-impact review.

### UIP-DEC-006 — CSS delivery

- **Owner:** Release Lead. **Authority:** ADR-UIP-PLT-001 section 5.
- **Position:** one aggregate component stylesheet plus explicit theme stylesheets for v1. The composition root imports them once. Component JavaScript has no CSS side-effect import. Remotes do not load another copy. Per-component CSS subpaths are outside v1.
- **Supported set:** the components listed in the release conformance record. For P0 this is the P2 reference slice: Button, one form control, one overlay, and one composite widget.
- **Alternatives:** per-component CSS subpaths; JavaScript side-effect imports.
- **Evidence:** the packed consumer renders the supported set; SSR style order is deterministic; federation tests assert one component stylesheet content hash and one instance of each selected theme asset under both remote load orders.

### UIP-DEC-007 — Module Federation sharing

- **Owner:** Integration Lead. **Authority:** ADR-UIP-PLT-001 section 5 and ADR-GLB-FE-012.
- **Position:** the host owns the share map.
  - `react`, `react-dom`, and `@scnx/core-ui` are singletons with a strict compatible range.
  - Every other context-bearing public entry is an explicit singleton share key generated from the export inventory.
  - Wildcard public exports are removed.
  - `requiredVersion` is the consuming application's declared peer or dependency range.
  - `@scnx/system` declares `@scnx/core-ui` as a peer dependency and a dev dependency.
  - Remotes are lazy; only the host may load eagerly.
- **Alternatives:** bare package-name keys; trailing-slash prefix keys; eager remotes.
- **Evidence:** `fixtures/federation/host`, `remote-a`, and `remote-b`, installed from tarballs, prove:
  - one React and context identity under both load orders;
  - lazy remote loading;
  - one stylesheet set;
  - a **controlled failure** when `remote-b` is built against an incompatible `@scnx/core-ui` major: its route renders the fallback, the host and `remote-a` keep working, and a telemetry event records both versions.

## Evidence rules

Source tests prove state and interaction logic. Producer tests prove generated outputs. Packed consumers prove published exports and assets. Integration fixtures prove host behavior. Product pages own complete WCAG conformance.

A numerical budget records the import path, raw/minified/compressed representation, tool, environment, baseline, and incremental consumer scenario. Every unresolved public CSS variable, invalid substituted property, missing export, duplicate stylesheet, or required fixture failure is a release failure.

Formal statuses change only after the required evidence and the named review authority approve the packet.
