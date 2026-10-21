import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

// jsdom 27 implements no HTMLDialogElement.showModal() or close(). This stub
// models only what unit tests observe: the open attribute, the close event,
// and Escape as a close request that fires a cancelable cancel first. Inertness, the top layer, and focus return
// are browser behavior, verified in Storybook and the packed matrix
// (TDD primitives P16).
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    for (const dialog of document.querySelectorAll('dialog[open]')) {
      if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) (dialog as HTMLDialogElement).close();
    }
  });
}

// jsdom implements no scrolling, so Element.scrollIntoView is missing; every
// supported browser has it. Test-only no-op (CodeSelect's ComboboxBase keeps
// the active option visible with it).
if (typeof Element !== "undefined" && typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
