import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactElement } from "react";
import { Slot, composeRefs } from "../../utils/Slot";
import { FloatingPortal, useDismiss, useFloating, useOpenState } from "../../utils/floating";
import type { PopoverBaseCloseProps, PopoverBaseContentProps, PopoverBaseProps, PopoverBaseTitleProps, PopoverBaseTriggerProps } from "./types";

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  hasTitle: boolean;
  setHasTitle: (has: boolean) => void;
  trigger: HTMLElement | null;
  setTrigger: (node: HTMLElement | null) => void;
  content: HTMLElement | null;
  setContent: (node: HTMLElement | null) => void;
  placement: NonNullable<PopoverBaseProps["placement"]>;
};
const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopover = (part: string): PopoverContextValue => {
  const context = useContext(PopoverContext);
  if (!context) throw new Error(`PopoverBase.${part} must be rendered inside PopoverBase`);
  return context;
};

/**
 * PopoverBase - a small interactive task anchored to its trigger, as a
 * non-modal dialog (APG dialog pattern, non-modal; TDD primitives P33). The
 * trigger opens and closes it and reports `aria-expanded`; the content is a
 * `dialog` named by its Title. Opening moves focus into the content (an
 * element with `autofocus`, else the first focusable one, else the content);
 * closing with Escape, the Close part, or the trigger returns focus to the
 * trigger, unless the reader has already moved it elsewhere. A press outside
 * closes it without moving focus. The page stays interactive: focus may leave
 * by Tab. The content renders into the theme provider's portal container.
 *
 * @example
 * ```tsx
 * <PopoverBase>
 *   <PopoverBase.Trigger>Share</PopoverBase.Trigger>
 *   <PopoverBase.Content>
 *     <PopoverBase.Title>Share link</PopoverBase.Title>
 *     <input aria-label="Link" readOnly value="https://…" />
 *     <PopoverBase.Close>Done</PopoverBase.Close>
 *   </PopoverBase.Content>
 * </PopoverBase>
 * ```
 */
const PopoverBaseRoot = ({ placement = "bottom-start", children, ...openState }: PopoverBaseProps): ReactElement => {
  const [open, setOpen] = useOpenState(openState);
  const contentId = useId();
  const titleId = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  useDismiss(open, [trigger, content], () => setOpen(false));
  const context = useMemo(
    () => ({ open, setOpen, contentId, titleId, hasTitle, setHasTitle, trigger, setTrigger, content, setContent, placement }),
    [open, setOpen, contentId, titleId, hasTitle, trigger, content, placement],
  );
  return <PopoverContext.Provider value={context}>{children}</PopoverContext.Provider>;
};

/** Opens and closes the popover; a native button unless `asChild`. */
const PopoverBaseTrigger = (props: PopoverBaseTriggerProps): ReactElement => {
  const { open, setOpen, contentId, setTrigger } = usePopover("Trigger");
  const shared = {
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
    "data-state": open ? "open" : "closed",
    onClick: () => setOpen(!open),
  };
  if (props.asChild) {
    return (
      <Slot ref={setTrigger} {...shared}>
        {props.children}
      </Slot>
    );
  }
  const { asChild: _, ref, onClick, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      {...shared}
      ref={composeRefs(setTrigger, ref)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) shared.onClick();
      }}
    />
  );
};

/** The non-modal dialog, rendered only while open. */
const PopoverBaseContent = ({ ref, ...props }: PopoverBaseContentProps): ReactElement | null => {
  const { open, contentId, titleId, hasTitle, trigger, content, setContent, placement } = usePopover("Content");
  useFloating(open, trigger, content, { placement });
  useEffect(() => {
    if (!open || !content) return;
    const target = content.querySelector<HTMLElement>("[autofocus]") ?? content.querySelector<HTMLElement>(FOCUSABLE) ?? content;
    target.focus({ preventScroll: true });
    return () => {
      // The content is gone: focus that was in it fell to the body.
      const active = document.activeElement;
      if (!active || active === document.body || content.contains(active)) trigger?.focus({ preventScroll: true });
    };
  }, [open, content, trigger]);
  if (!open) return null;
  return (
    <FloatingPortal name="PopoverBase">
      <div
        tabIndex={-1}
        {...props}
        ref={composeRefs(setContent, ref)}
        role="dialog"
        id={contentId}
        aria-labelledby={hasTitle ? titleId : props["aria-labelledby"]}
        data-state="open"
      />
    </FloatingPortal>
  );
};

/** The popover's name, as a heading. */
const PopoverBaseTitle = (props: PopoverBaseTitleProps): ReactElement => {
  const { titleId, setHasTitle } = usePopover("Title");
  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return <h2 {...props} id={titleId} />;
};

/** Closes the popover. */
const PopoverBaseClose = (closeProps: PopoverBaseCloseProps): ReactElement => {
  const { setOpen } = usePopover("Close");
  if (closeProps.asChild) return <Slot onClick={() => setOpen(false)}>{closeProps.children}</Slot>;
  const { asChild: _, onClick, ...props } = closeProps;
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
};

PopoverBaseRoot.displayName = "PopoverBase";
PopoverBaseTrigger.displayName = "PopoverBase.Trigger";
PopoverBaseContent.displayName = "PopoverBase.Content";
PopoverBaseTitle.displayName = "PopoverBase.Title";
PopoverBaseClose.displayName = "PopoverBase.Close";

export const PopoverBase = Object.assign(PopoverBaseRoot, {
  Trigger: PopoverBaseTrigger,
  Content: PopoverBaseContent,
  Title: PopoverBaseTitle,
  Close: PopoverBaseClose,
});
