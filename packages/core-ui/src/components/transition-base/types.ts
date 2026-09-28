import type { ComponentPropsWithRef, CSSProperties } from "react";

/**
 * Lifecycle phases of the Orthogonal Finite State Machine.
 */
export type TransitionStatus = 
  /** Initial hidden state or fully collapsed. */
  | "entering"
  /** Animation in progress towards the visible state (styleTo). */
  | "settled"
  /** 
   * Final state after opening animation complete; 
   * layout reconciled to 'auto' if applicable. 
   */
  | "exiting"
  /** Animation in progress towards the hidden state (styleFrom). */
  | "closed";

/**
 * Prop contract for the TransitionBase engine.
 */
export type TransitionBaseProps = {
  /** 
   * Bypasses the state machine and animation logic for instant state changes. 
   * Useful for high-performance conditional rendering without visual effects.
   */
  disableAnimation?: boolean;

  /**
   * The primary driver of the state machine.
   * - `false`: Triggers the opening sequence (`entering` -> `settled`).
   * - `true`: Triggers the closing sequence (`exiting` -> `closed`).
   */
  smoothClose: boolean;
  
  /** 
   * Initial visual state (e.g., height: 0, opacity: 0). 
   * Used as the target for the `exiting` phase.
   */
  styleFrom: CSSProperties;
  
  /** 
   * Target visual state (e.g., height: 'auto', opacity: 1). 
   * Used as the target for the `entering` phase.
   */
  styleTo: CSSProperties;
  
  /** Callback fired when the 'entering' phase settles into 'settled'. */
  onOpened?: () => void;
  
  /** Callback fired when the 'exiting' phase settles into 'closed'. */
  onClosed?: () => void;
} & ComponentPropsWithRef<"div">;
