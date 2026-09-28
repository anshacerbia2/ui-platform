# Guide: Component Accessibility Conformance Report

Status: working guidance for the proposed UI Platform contract, 2026-09-28. This report records component evidence; it does not certify a consuming page or complete product.

## Terminology and boundary

Use **Component Accessibility Conformance Report (Component ACR)** for a UI Platform component. Evaluate applicable WCAG 2.2 success criteria, the relevant WAI-ARIA Authoring Practices pattern, native HTML behavior, and assistive-technology observations.

Do not label a component report as a VPAT. A VPAT-based ACR is reserved for a complete product evaluation that includes page composition, content, navigation, workflows, and product-owned behavior. Product teams may aggregate Component ACR evidence, but they remain responsible for full-page conformance.

## Report identity

- Component, package, version, source commit, and tarball checksum:
- Public import path and CSS/theme imports:
- Reviewer and review date:
- Browser, operating system, input method, screen reader, locale, direction, theme, and viewport:
- Governing TDD, behavior matrix, and known exceptions:

## Contract under test

- Native element or ARIA pattern:
- Accessible name and description source:
- Roles, states, properties, and stable DOM relationships:
- Keyboard, pointer, touch, focus entry, focus movement, and focus restoration:
- Controlled/uncontrolled, disabled, readonly, validation, loading, and error behavior:
- Reduced motion, forced colors, zoom/reflow, and target-size scenarios where applicable:

## Evidence matrix

| Criterion or pattern requirement | Applicable state/scenario                 | Expected behavior  | Result                                    | Evidence link / issue            |
| -------------------------------- | ----------------------------------------- | ------------------ | ----------------------------------------- | -------------------------------- |
| WCAG 2.2 / APG reference         | Theme, viewport, locale, direction, input | Observable outcome | Pass / Fail / Not applicable / Not tested | CI, trace, screenshot, or defect |

`Not applicable` and `Not tested` require an explanation. Automated scans supplement keyboard, focus, browser, and assistive-technology checks; they do not replace them.

## Consumer responsibilities

Record responsibilities that remain outside the component, including page landmarks, heading order, surrounding labels or instructions, route focus, content alternatives, workflow errors, and page-level color or reflow interactions.

## Decision

- Supported scenarios:
- Known limitations and blocking defects:
- Exception owner and expiry:
- Release decision and approving authority:

Attach this report to the [release conformance record](../architecture/RELEASE_CONFORMANCE_TEMPLATE.md). Re-run it when behavior, semantics, rendered DOM, supported React/browser versions, or accessibility dependencies change.
