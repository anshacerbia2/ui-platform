"use client";

import { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import type { TransitionStatus, TransitionBaseProps } from "./types";

/**
 * TransitionBase - High-performance Orthogonal Finite State Machine (OFSM)
 * for layout transitions.
 *
 * **Objective**: Provides deterministic lifecycle transition management,
 * ensuring that CSS transitions firing during component mount and right
 * before unmount are synchronized and stable.
 *
 * @example
 * ```tsx
 * <TransitionBase
 *   smoothClose={!isOpen}
 *   styleFrom={{ height: 0, opacity: 0 }}
 *   styleTo={{ height: 'auto', opacity: 1 }}
 *   onClosed={() => console.log('Transition complete')}
 * >
 *   <div className="content">...</div>
 * </TransitionBase>
 * ```
 * 
 * @remarks
 * **Architecture & Mechanics**
 * - **OFSM Primary Phase** [Output: `data-state`]: Manages lifecycle
 *   transitions between `closed`, `entering`, `settled`, and `exiting`.
 * - **Lifecycle Sync** [Output: `data-mounted`]: Signals when the component
 *   has completed its initial mount-transition sequence.
 * - **Interaction Intent** [Output: `data-interrupted`]: Tracks momentum
 *   reversal via `isResuming` to signal when an animation has been interrupted.
 * - **Dynamic Reconciliation**: Resolves `height: auto` by injecting fixed
 *   pixel measurements during active transitions.
 * - **Frame Sanitization**: Proactively clears the animation queue to
 *   prevent RAF stacking (Zero-Stack mechanism).
 */
export const TransitionBase = ({
  ref,
  className,
  style,
  styleFrom,
  styleTo,
  smoothClose,
  disableAnimation,
  onClosed,
  onOpened,
  children,
  ...rest
}: TransitionBaseProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    style,
    styleFrom,
    styleTo,
    disableAnimation,
    onOpened,
    onClosed,
  });
  const statusRef = useRef<TransitionStatus>(
    disableAnimation ? (smoothClose ? "closed" : "settled") : "closed"
  );
  const prevStylesSnapshot = useRef("");
  const isInitRender = useRef(true);
  const animFrameIds = useRef<number[]>([]);

  const [status, setStatus] = useState<TransitionStatus>(
    disableAnimation ? (smoothClose ? "closed" : "settled") : "closed"
  );
  const [isSettled, setIsSettled] = useState(!!disableAnimation && !smoothClose);
  const [isResuming, setIsResuming] = useState(false);
  const [currentStyle, setCurrentStyle] = useState({
    ...style,
    ...(disableAnimation
      ? { ...(smoothClose ? styleFrom : styleTo), transition: "none" }
      : !smoothClose
        ? styleFrom
        : styleTo),
  });

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    []
  );

  /**
   * Layout Reconciliation: Converts 'auto' height into fixed pixel values.
   * Forces a reflow to measure scrollHeight accurately, enabling smooth 
   * CSS transitions for dynamic content height.
   */
  const resolveHeight = useCallback((targetStyle: any) => {
    if (!nodeRef.current) return targetStyle || {};

    // Force Reflow (Manual Layout Flush for Deterministic Animation)
    void nodeRef.current.offsetHeight;

    if (targetStyle?.height === "auto") {
      const sh = nodeRef.current.scrollHeight;

      // Safety: If scrollHeight is still 0, the children might be hidden or not layouted.
      if (sh === 0) return targetStyle;

      return { ...targetStyle, height: `${sh}px` };
    }
    return targetStyle || {};
  }, []);

  /**
   * Frame Purifier:
   * Cleans up the render stack to prevent animation frame stacking (Zero-Stack mechanism).
   */
  const clearPendingFrames = useCallback(() => {
    animFrameIds.current.forEach(cancelAnimationFrame);
    animFrameIds.current = [];
  }, []);

  /**
   * Stability Cascade:
   * Snaps the current layout state to fixed pixels before initiating a momentum reversal.
   * Includes a "Momentum Kickstart" by modifying the current value by 1px in the 
   * direction of the new intent to bypass compositor frame coalescing.
   */
  const snapToCurrentPixels = useCallback((isOpening: boolean) => {
    if (!nodeRef.current) return;

    // Force Reflow (Manual Layout Flush for Deterministic Animation)
    void nodeRef.current.offsetHeight;

    const computed = window.getComputedStyle(nodeRef.current).height;
    let heightVal =
      computed === "auto" ? nodeRef.current.scrollHeight : parseFloat(computed);

    // [SCNX Elite] Momentum Kickstart:
    // We adjust by +/- 1px relative to the *new intent* to ensure the next frame 
    // is visually distinct from any frame already in the GPU queue.
    if (isOpening) {
      heightVal = heightVal + 1; // Kickstart Opening
    } else {
      heightVal = Math.max(0, heightVal - 1); // Kickstart Closing
    }

    setCurrentStyle((prev: any) => ({ ...prev, height: `${heightVal}px` }));
  }, []);

  /**
   * Atomic Transition Orchestrator:
   * Manages the Double-Sync Invariant for high-performance layout reconciliation.
   * Uses nested requestAnimationFrame to ensure the browser has registered the snap state
   * before applying the transition target.
   */
  const applyAtomicTransition = useCallback(
    (target: CSSProperties, isOpening: boolean, checkInstantSettle = false) => {
      // 0. Frame Sanitization: Cancel any pending transition logic to prevent frame stacking.
      clearPendingFrames();

      // A. Performance Guard: If animation is disabled, sync instantly.
      // Read from propsRef to ensure functional identity remains static.
      if (propsRef.current.disableAnimation) {
        const resolved = resolveHeight(target);
        setCurrentStyle({
          ...propsRef.current.style,
          ...resolved,
          transition: "none",
        });
        return;
      }

      // B. Reactive Pivot: Snap and resolve the new target.
      snapToCurrentPixels(isOpening);

      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => {
          if (!nodeRef.current) return;

          // Force reflow to ensure the browser registers initial styles before transition
          void nodeRef.current.offsetHeight;

          const resolved = resolveHeight(target);
          setCurrentStyle({ ...propsRef.current.style, ...resolved });

          // C. Professional Guard: Short-circuit if target reached instantly.
          if (
            checkInstantSettle &&
            (nodeRef.current.scrollHeight === 0 || resolved.height === "auto")
          ) {
            setStatus("settled");
            setIsSettled(true);
          }
        });
        animFrameIds.current.push(id2);
      });
      animFrameIds.current.push(id1);
    },
    [resolveHeight, snapToCurrentPixels, clearPendingFrames]
  );

  const executeFadeIn = useCallback(
    (interrupt = false) => {
      setStatus("entering");
      setIsResuming(interrupt);
      applyAtomicTransition(propsRef.current.styleTo, true, true);
    },
    [applyAtomicTransition]
  );

  const executeFadeOut = useCallback(
    (interrupt = false) => {
      setStatus("exiting");
      setIsResuming(interrupt);
      applyAtomicTransition(propsRef.current.styleFrom, false);
    },
    [applyAtomicTransition]
  );

  // Synchronize statusRef for "Absolute Reality" tracking.
  // This allows effects to read the real-time phase without being reactive dependencies.
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Prop-Ref Pattern: We track volatile props via ref to ensure internal
  // handlers maintain a stable referential identity while always accessing latest data.
  useEffect(() => {
    propsRef.current = {
      style,
      styleTo,
      styleFrom,
      disableAnimation,
      onOpened,
      onClosed,
    };
  }, [style, styleTo, styleFrom, disableAnimation, onOpened, onClosed]);

  useEffect(() => {
    if (isInitRender.current) {
      if (propsRef.current.disableAnimation) {
        if (!smoothClose) {
          setStatus("settled");
          setIsSettled(true);
          if (propsRef.current.onOpened) propsRef.current.onOpened();
        }
      } else {
        if (!smoothClose) {
          executeFadeIn();
        }
      }
    }
  }, []); // Mount only, no deps.

  // Synchronize smoothClose with OFSM Regions
  useEffect(() => {
    const isFirstRun = isInitRender.current;

    if (isFirstRun) {
      isInitRender.current = false;
      return;
    }

    // B. Reactive Update Logic: Handle instant transitions when disabled
    if (propsRef.current.disableAnimation) {
      if (smoothClose) {
        setStatus("closed");
        setIsSettled(false);
        applyAtomicTransition(propsRef.current.styleFrom, false);
        if (propsRef.current.onClosed) propsRef.current.onClosed();
      } else {
        setStatus("settled");
        setIsSettled(true);
        applyAtomicTransition(propsRef.current.styleTo, true);
        if (propsRef.current.onOpened) propsRef.current.onOpened();
      }
      return;
    }

    // C. ANIMATION MODE: Standard FSM logic for updates
    const currentPhase = statusRef.current;

    if (smoothClose) {
      // Intent: Close. Only trigger if we aren't already closing or closed.
      if (currentPhase !== "exiting" && currentPhase !== "closed") {
        executeFadeOut(currentPhase === "entering");
      }
    } else {
      // Intent: Open. Only trigger if we aren't already opening or opened.
      if (currentPhase !== "entering" && currentPhase !== "settled") {
        executeFadeIn(currentPhase === "exiting");
      }
    }
  }, [smoothClose, executeFadeIn, executeFadeOut]);

  // Global Bi-Directional Reconciliation Gate
  // Monitor both targets for reactive layout pivots.
  useEffect(() => {
    const snapshot = JSON.stringify({ style, styleTo, styleFrom });
    const isFirstRun = prevStylesSnapshot.current === "";

    // 1. Strict Style Guard: Only proceed if style props have actually changed.
    // We compare BEFORE updating the ref to detect the delta.
    if (!isFirstRun && snapshot === prevStylesSnapshot.current) return;

    // 2. Commit the new snapshot to memory.
    prevStylesSnapshot.current = snapshot;

    // 3. Initial Silence: Skip reconciliation on mount to avoid double-snapping with Effect 1.
    if (isFirstRun) return;

    const currentPhase = statusRef.current;

    // A. Passive Sync: If closed, just ensure DOM is aligned with styleFrom.
    if (currentPhase === "closed") {
      setCurrentStyle({ ...style, ...styleFrom });
      return;
    }

    // B. Reactive Target Selection
    const isOpening = currentPhase === "entering" || currentPhase === "settled";
    const targetStyles = isOpening ? styleTo : styleFrom;

    applyAtomicTransition(targetStyles, isOpening, true);
  }, [style, styleTo, styleFrom, applyAtomicTransition]);

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      clearPendingFrames();
    };
  }, [clearPendingFrames]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (status === "entering") {
      setStatus("settled");
      setIsSettled(true);
      setIsResuming(false);
      if (propsRef.current.onOpened) propsRef.current.onOpened();
    }

    // Post-expansion cleanup for auto-height (Universal: handles entering OR settled reconciliation)
    if (status === "entering" || status === "settled") {
      if (styleTo?.height === "auto" || styleTo?.height === "100%") {
        setCurrentStyle((prev: any) => ({ ...prev, height: "auto" }));
      }
    }

    if (status === "exiting") {
      setStatus("closed");
      setIsResuming(false);
      if (propsRef.current.onClosed) propsRef.current.onClosed();
    }
  };

  return (
    <div
      ref={setRef}
      className={className}
      data-state={status}
      data-mounted={isSettled || undefined}
      data-interrupted={isResuming || undefined}
      onTransitionEnd={onTransitionEnd}
      style={{
        ...style,
        ...currentStyle,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

TransitionBase.displayName = "TransitionBase";
