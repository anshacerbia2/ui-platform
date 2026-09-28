# Implementation Plan: Design System Transition Orchestration

We will implement the `TransitionBase` engine inside the specific `design-system` organisms to handle the disclosure lifecycle while keeping `core-ui` primitives 100% logic-only.

## Proposed Changes

### [design-system]

#### [MODIFY] [CodeShowcaseContent.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/design-system/src/components/organisms/code-showcase/CodeShowcaseContent.tsx)
- Integrate `TransitionBase` to handle the `height: auto` transition.
- Use `useDisclosureItem` to get the `isClosing` signal.
- Bind `TransitionBase` to `isClosing` and finalize the state via `onClosed`.

#### [NEW] [AccordionTrigger.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/design-system/src/components/organisms/accordion/AccordionTrigger.tsx)
- Create a styled trigger that delegates to `CollapsibleBaseTrigger`.
- Maintain the "Expert" Render Props pattern.

#### [NEW] [AccordionContent.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/design-system/src/components/organisms/accordion/AccordionContent.tsx)
- Create a styled content wrapper.
- Integrate `TransitionBase` to handle the `height: auto` transition.
- Bind `TransitionBase` to `isClosing` and finalize the state via `onClosed`.

#### [MODIFY] [Accordion.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/design-system/src/components/organisms/accordion/Accordion.tsx)
- Export the new `Trigger` and `Content` sub-components.

## Verification Plan

### Manual Verification (Browser)
1. **Accordion Animation**:
   - Verify that clicking an Accordion item expands/collapses with height animation.
   - Verify that opening one item closes the other smoothly (Handshake Registry).
2. **CodeShowcase Animation**:
   - Verify that clicking "Show Code" expands smoothly.
   - Verify it closes completely when toggled off.
