import type { ComponentPropsWithRef, CSSProperties } from "react";

/** Phase of the transition finite state machine; rendered as `data-state`. */
export type TransitionPhase = "closed" | "entering" | "settled" | "exiting";

export type TransitionIntent = "open" | "close";

/** How the last intent completed (TDD theme, Data Model: TransitionRecord). */
export type TransitionCompletion = "event" | "timeout" | "instant";

export type TransitionBaseProps = {
  /** Positive intent: `true` opens (entering -> settled), `false` closes (exiting -> closed). */
  open: boolean;
  /**
   * Settle synchronously with no animation and no layout reads. Reduced
   * motion (`prefers-reduced-motion: reduce`) takes the same branch.
   */
  disabled?: boolean;
  /** Closed visual state, for example `{ height: 0, opacity: 0 }`. */
  styleFrom?: CSSProperties;
  /** Open visual state; `height: "auto"` is measured during the transition. */
  styleTo?: CSSProperties;
  /** Fires once per completed open intent. */
  onOpened?: () => void;
  /** Fires once per completed close intent. */
  onClosed?: () => void;
} & ComponentPropsWithRef<"div">;
