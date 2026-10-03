import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useHydrated } from "../../utils/use-hydrated";
import { computedTiming, fallbackTimeout } from "./timing";
import type { TransitionBaseProps, TransitionCompletion, TransitionIntent, TransitionPhase } from "./types";

const EMPTY: CSSProperties = {};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)")?.matches === true;

const kebab = (property: string) => property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** Drop an instant-branch `transition: none` so the element's own transition runs again. */
const animatable = (style: CSSProperties): CSSProperties => {
  if (style.transition !== "none") return style;
  const { transition: _, ...rest } = style;
  return rest;
};

/**
 * TransitionBase - one element-local, interruptible transition finite state
 * machine (TDD theme, "Transition finite state machine"; THM-006..008).
 *
 * ```text
 * closed --open--> entering --complete--> settled
 * settled --close--> exiting --complete--> closed
 * entering --close--> exiting      exiting --open--> entering
 * ```
 *
 * - Each intent increments a generation; frames, events, and timeouts
 *   capture it, so a stale completion does nothing.
 * - Completion is the first of: a `transitionend`/`animationend` on this
 *   element for a property it owns, or a timeout of the computed
 *   duration + delay plus a safety margin, capped.
 * - `disabled`, reduced motion, and zero duration settle synchronously
 *   without reading layout.
 * - `onOpened`/`onClosed` fire at most once per completed intent and never
 *   after unmount.
 *
 * @example
 * ```tsx
 * <TransitionBase open={isOpen} styleFrom={{ height: 0, opacity: 0 }} styleTo={{ height: "auto", opacity: 1 }} onClosed={unmount}>
 *   <div className="content">...</div>
 * </TransitionBase>
 * ```
 */
export const TransitionBase = ({
  ref,
  open,
  disabled = false,
  styleFrom = EMPTY,
  styleTo = EMPTY,
  onOpened,
  onClosed,
  style,
  hidden,
  children,
  ...rest
}: TransitionBaseProps) => {
  // Server markup and hydration carry no computed style: a strict CSP blocks
  // style attributes. Until hydration, a closed transition is `hidden` instead
  // (TDD theme THM-009).
  const hydrated = useHydrated();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const settledAtMount = open && disabled;
  const [phase, setPhase] = useState<TransitionPhase>(settledAtMount ? "settled" : "closed");
  const [motionStyle, setMotionStyle] = useState<CSSProperties>(() =>
    settledAtMount ? { ...styleTo, transition: "none" } : { ...styleFrom },
  );
  const [interrupted, setInterrupted] = useState(false);
  const [hasOpened, setHasOpened] = useState(settledAtMount);

  const latest = useRef({ styleFrom, styleTo, onOpened, onClosed, disabled });
  latest.current = { styleFrom, styleTo, onOpened, onClosed, disabled };

  const machine = useRef({
    generation: 0,
    intent: null as TransitionIntent | null,
    phase: (settledAtMount ? "settled" : "closed") as TransitionPhase,
    done: true,
    notify: false,
    alive: false,
    frame: 0,
    timeout: 0 as ReturnType<typeof setTimeout> | 0,
    detach: null as (() => void) | null,
    completion: null as TransitionCompletion | null,
  });

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const cancel = useCallback(() => {
    const m = machine.current;
    if (m.frame) cancelAnimationFrame(m.frame);
    if (m.timeout) clearTimeout(m.timeout);
    m.detach?.();
    m.frame = 0;
    m.timeout = 0;
    m.detach = null;
  }, []);

  const enter = useCallback((next: TransitionPhase) => {
    machine.current.phase = next;
    setPhase(next);
  }, []);

  const settle = useCallback(
    (generation: number, completion: TransitionCompletion) => {
      const m = machine.current;
      if (!m.alive || generation !== m.generation || m.done) return;
      m.done = true;
      m.completion = completion;
      cancel();
      const opening = m.intent === "open";
      enter(opening ? "settled" : "closed");
      setInterrupted(false);
      if (opening) {
        setHasOpened(true);
        if (latest.current.styleTo.height === "auto") setMotionStyle((s) => ({ ...s, height: "auto" }));
      }
      if (!m.notify) return;
      m.notify = false;
      (opening ? latest.current.onOpened : latest.current.onClosed)?.();
    },
    [cancel, enter],
  );

  /**
   * Start an intent. A retarget keeps the current intent (new styles while
   * open or closing) and fires a callback only if that intent had not completed.
   */
  const run = useCallback(
    (intent: TransitionIntent, retarget = false) => {
      const m = machine.current;
      cancel();
      const generation = ++m.generation;
      const reversing = !retarget && (m.phase === "entering" || m.phase === "exiting");
      m.notify = retarget ? m.notify && !m.done : true;
      m.intent = intent;
      m.done = false;
      const target = intent === "open" ? latest.current.styleTo : latest.current.styleFrom;
      const node = nodeRef.current;

      // Instant branch: no frames, no layout reads.
      if (latest.current.disabled || prefersReducedMotion() || !node) {
        setMotionStyle({ ...target, transition: "none" });
        settle(generation, "instant");
        return;
      }

      enter(intent === "open" ? "entering" : "exiting");
      setInterrupted(reversing);

      // Read the current pixels once and write them as the start frame.
      const start: CSSProperties = "height" in target ? { height: `${node.getBoundingClientRect().height}px` } : {};
      setMotionStyle((s) => ({ ...animatable(s), ...start }));

      m.frame = requestAnimationFrame(() => {
        if (generation !== m.generation || !m.alive) return;
        const resolved = target.height === "auto" ? { ...target, height: `${node.scrollHeight}px` } : target;
        setMotionStyle((s) => ({ ...animatable(s), ...resolved }));

        // Arm completion once the target styles are committed.
        m.frame = requestAnimationFrame(() => {
          m.frame = 0;
          if (generation !== m.generation || !m.alive) return;
          const timeout = fallbackTimeout(computedTiming(getComputedStyle(node)));
          if (timeout === 0) {
            settle(generation, "instant");
            return;
          }
          const owned = new Set(Object.keys(target).map(kebab));
          const onEnd = (event: Event) => {
            if (event.target !== node) return;
            const property = (event as TransitionEvent).propertyName;
            if (event.type === "transitionend" && owned.size > 0 && property && !owned.has(property)) return;
            settle(generation, "event");
          };
          node.addEventListener("transitionend", onEnd);
          node.addEventListener("animationend", onEnd);
          m.detach = () => {
            node.removeEventListener("transitionend", onEnd);
            node.removeEventListener("animationend", onEnd);
          };
          m.timeout = setTimeout(() => settle(generation, "timeout"), timeout);
        });
      });
    },
    [cancel, enter, settle],
  );

  // Intent: the mount and every change of `open`. A Strict Mode remount
  // restarts an intent its cleanup cancelled but never repeats a completed one.
  useEffect(() => {
    const m = machine.current;
    m.alive = true;
    const intent: TransitionIntent = open ? "open" : "close";
    if (m.intent === null && !open) {
      // Mounted closed: nothing to complete.
    } else if (m.intent !== intent || !m.done) {
      run(intent);
    }
    return () => {
      m.alive = false;
      cancel();
    };
  }, [open, run, cancel]);

  // Retarget when the open or closed styles change.
  const styleKey = JSON.stringify([styleFrom, styleTo]);
  const previousStyleKey = useRef(styleKey);
  useEffect(() => {
    if (previousStyleKey.current === styleKey) return;
    previousStyleKey.current = styleKey;
    const m = machine.current;
    if (m.phase === "closed") setMotionStyle({ ...latest.current.styleFrom });
    else run(m.phase === "exiting" ? "close" : "open", true);
  }, [styleKey, run]);

  return (
    <div
      ref={setRef}
      data-state={phase}
      data-mounted={hasOpened || undefined}
      data-interrupted={interrupted || undefined}
      style={hydrated ? { ...style, ...motionStyle } : style}
      hidden={hidden || (!hydrated && phase === "closed") || undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

TransitionBase.displayName = "TransitionBase";
