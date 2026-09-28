# Guide: OKLCH output validation

Status: proposed verification guidance, 2026-09-28. The read-only microfrontend guide GD-SCNX-UI-JS-003 is empty and defines no implementation.

## Authoring and serialization

The current Sass core stores OKLCH channels. The injector must serialize a value according to the CSS property that will consume it. A Sass list represented by `meta.inspect` can emit parentheses or a trailing comma that are invalid for `box-shadow`. A token that already contains `oklch(...)` must not be wrapped as `rgb(oklch(...))`.

Treat channels, complete color functions, alpha colors, and shadow lists as distinct value types. Record an explicit serializer and consuming CSS grammar for each. Do not infer validity from a successful Sass build.

## Release checks

1. Parse every published theme stylesheet and enumerate `--ds-*` definitions and `var(--ds-*)` references.
2. In an isolated browser consumer, apply each supported theme and read computed properties that consume colors, shadows, borders, text, and focus rings.
3. Check actual foreground/background combinations and interaction states for the declared contrast target.
4. Test alpha values on their documented backgrounds and check fallback behavior in the supported browser matrix.
5. Render two different theme roots together to detect selector leakage.

A CSS parser can accept a custom-property value that later becomes invalid after substitution. Browser computed styles close that gap. For the extracted baseline, `low` and `focus` shadows and an achromatic color expression are known failing examples to turn into regression tests.

See [the token TDD](../02-designs/TDD-ui-platform-tokens-003-theme-and-token-output.md) and the [release record template](../architecture/RELEASE_CONFORMANCE_TEMPLATE.md).
