# Implementation Plan: Disclosure Lifecycle Orchestration

The `CollapsibleBaseContent` is currently stuck in the `isClosing` state because it lacks a transition engine to finalize the closing phase. We will integrate `TransitionBase` to handle the height animations and signal the Registry when the transition is complete.

## Proposed Changes

### [core-ui]

#### [MODIFY] [CollapsibleBaseContent.tsx](file:///d:/Ansha/js/module_federation_v1.5/packages/core-ui/src/components/collapsible-base/CollapsibleBaseContent.tsx)
- Integrate `TransitionBase` as the core animation engine.
- Bind `TransitionBase`'s `smoothClose` prop to the registry's `isClosing` signal.
- Implement `onClosed` callback to update the registry: `setIsOpen(false)` and `setIsClosing(false)`.
- Pass `disabledAnimations` from registry to `TransitionBase` to support "Snap Mode".
- Maintain the "Presence Gate" (`shouldRender`) while allowing `TransitionBase` to handle the final unmount.

## Verification Plan

### Manual Verification (Browser)
1. **Scenario 1: Standalone Toggle**
   - Click "VIEW CODE" in the `CodeShowcase` test page.
   - Verify it expands with smooth height animation.
   - Click "CLOSE CODE".
   - Verify it collapses smoothly and the trigger text updates correctly.

2. **Scenario 2: Registry Orchestration (Accordion)**
   - Click Snippet #1, then click Snippet #2.
   - Verify Snippet #1 closes WHILE Snippet #2 expands.

3. **Scenario 4: Snap Mode**
   - Test Case 3 in the test page. 
   - Verify no animation occurs and state changes instantly.
