import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type PointerEvent, type ReactElement } from "react";
import { Slot, composeRefs } from "../../utils/Slot";
import { FloatingPortal, useDismiss, useFloating, useOpenState } from "../../utils/floating";
import type { TooltipBaseContentProps, TooltipBaseProps, TooltipBaseTriggerProps } from "./types";

// A pointer may cross the gap from the trigger to the tooltip without closing
// it, so the tooltip stays hoverable (WCAG 2.2 SC 1.4.13).
const CLOSE_GRACE = 100;

type TooltipContextValue = {
  open: boolean;
  contentId: string;
  trigger: HTMLElement | null;
  setTrigger: (node: HTMLElement | null) => void;
  content: HTMLElement | null;
  setContent: (node: HTMLElement | null) => void;
  show: (afterDelay: boolean) => void;
  hide: (afterGrace: boolean) => void;
  placement: NonNullable<TooltipBaseProps["placement"]>;
};
const TooltipContext = createContext<TooltipContextValue | null>(null);

const useTooltip = (part: string): TooltipContextValue => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error(`TooltipBase.${part} must be rendered inside TooltipBase`);
  return context;
};

/**
 * TooltipBase - a short name or description of a control, on hover and
 * keyboard focus (APG tooltip pattern; TDD primitives P32). The trigger is its
 * single focusable child and is described by the tooltip while it is open. A
 * resting pointer opens it after `delay`; keyboard focus opens it at once; it
 * closes on blur, on a press, on Escape (with focus kept on the trigger), and
 * when the pointer leaves both the trigger and the tooltip. A pointer may move
 * onto the tooltip, which stays open (WCAG 2.2 SC 1.4.13). Touch does not open
 * it. The tooltip renders into the theme provider's portal container and holds
 * no interactive content; that is a popover.
 *
 * @example
 * ```tsx
 * <TooltipBase>
 *   <TooltipBase.Trigger><button aria-label="Copy link">⧉</button></TooltipBase.Trigger>
 *   <TooltipBase.Content>Copy link</TooltipBase.Content>
 * </TooltipBase>
 * ```
 */
const TooltipBaseRoot = ({ delay = 400, placement = "top", children, ...openState }: TooltipBaseProps): ReactElement => {
  const [open, setOpen] = useOpenState(openState);
  const contentId = useId();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clear = () => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
  };
  useEffect(() => clear, []);
  const show = useCallback(
    (afterDelay: boolean) => {
      clear();
      if (afterDelay && delay > 0) timer.current = setTimeout(() => setOpen(true), delay);
      else setOpen(true);
    },
    [delay, setOpen],
  );
  const hide = useCallback(
    (afterGrace: boolean) => {
      clear();
      if (afterGrace) timer.current = setTimeout(() => setOpen(false), CLOSE_GRACE);
      else setOpen(false);
    },
    [setOpen],
  );
  useDismiss(open, [trigger, content], () => hide(false));
  const context = useMemo(
    () => ({ open, contentId, trigger, setTrigger, content, setContent, show, hide, placement }),
    [open, contentId, trigger, content, show, hide, placement],
  );
  return <TooltipContext.Provider value={context}>{children}</TooltipContext.Provider>;
};

const isKeyboardFocus = (element: Element): boolean => {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
};

/** The trigger: its single focusable child, described by the tooltip while it is open. */
const TooltipBaseTrigger = ({ children }: TooltipBaseTriggerProps): ReactElement => {
  const { open, contentId, setTrigger, show, hide } = useTooltip("Trigger");
  return (
    <Slot
      ref={setTrigger}
      aria-describedby={open ? contentId : undefined}
      data-state={open ? "open" : "closed"}
      onPointerEnter={(event: PointerEvent) => {
        if (event.pointerType !== "touch") show(true);
      }}
      onPointerLeave={(event: PointerEvent) => {
        if (event.pointerType !== "touch") hide(true);
      }}
      onPointerDown={() => hide(false)}
      onFocus={(event: FocusEvent<HTMLElement>) => {
        if (isKeyboardFocus(event.currentTarget)) show(false);
      }}
      onBlur={() => hide(false)}
    >
      {children}
    </Slot>
  );
};

/** The tooltip, rendered only while open. */
const TooltipBaseContent = ({ ref, onPointerEnter, onPointerLeave, ...props }: TooltipBaseContentProps): ReactElement | null => {
  const { open, contentId, trigger, content, setContent, show, hide, placement } = useTooltip("Content");
  useFloating(open, trigger, content, { placement });
  if (!open) return null;
  return (
    <FloatingPortal name="TooltipBase">
      <div
        {...props}
        ref={composeRefs(setContent, ref)}
        role="tooltip"
        id={contentId}
        data-state="open"
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          show(false);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          hide(true);
        }}
      />
    </FloatingPortal>
  );
};

TooltipBaseRoot.displayName = "TooltipBase";
TooltipBaseTrigger.displayName = "TooltipBase.Trigger";
TooltipBaseContent.displayName = "TooltipBase.Content";

export const TooltipBase = Object.assign(TooltipBaseRoot, { Trigger: TooltipBaseTrigger, Content: TooltipBaseContent });
