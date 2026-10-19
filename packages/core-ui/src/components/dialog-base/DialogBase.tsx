import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { composeRefs } from "../../utils/Slot";
import type { DialogBaseCloseProps, DialogBaseDescriptionProps, DialogBaseProps, DialogBaseTitleProps } from "./types";

type DialogContextValue = { titleId: string; descriptionId: string; setDescribed: (described: boolean) => void; close: () => void };
const DialogContext = createContext<DialogContextValue | null>(null);

const useDialog = (part: string): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) throw new Error(`DialogBase.${part} must be rendered inside DialogBase`);
  return context;
};

/**
 * DialogBase - a modal dialog on the native `<dialog>` element (TDD
 * primitives P16).
 *
 * Controlled by `open` and `onOpenChange`; the prop alone opens and closes the
 * element. It opens only with `showModal()`, so the browser makes the page
 * inert, renders the dialog in the top layer, moves focus in, and returns
 * focus on close. Escape and `DialogBase.Close` report `onOpenChange(false)`
 * synchronously.
 *
 * @example
 * ```tsx
 * <DialogBase open={open} onOpenChange={setOpen}>
 *   <DialogBase.Title>Delete the payroll run?</DialogBase.Title>
 *   <DialogBase.Description>The run and its payslips are removed.</DialogBase.Description>
 *   <DialogBase.Close>Cancel</DialogBase.Close>
 * </DialogBase>
 * ```
 */
const DialogBaseRoot = ({ open, onOpenChange, id: idProp, ref, children, "aria-label": ariaLabel, ...rest }: DialogBaseProps): ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const generated = useId();
  const id = idProp ?? generated;
  const [described, setDescribed] = useState(false);
  const report = useRef(onOpenChange);
  report.current = onOpenChange;
  const isOpen = useRef(open);
  isOpen.current = open;
  // Report a close synchronously, once, while the prop still says open.
  const requestClose = useRef(() => {
    if (isOpen.current) report.current(false);
  }).current;

  // The prop drives the element: open only through showModal().
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // A close request (Escape) fires `cancel` synchronously; the dialog
  // cancels it when allowed so that the prop closes the element, and reports
  // false at once. The `close` event is queued as a task, so it only reports
  // closes the dialog did not request (a method="dialog" form), and only while
  // the element is still closed: a late event for an earlier close must not
  // close a dialog that has been opened again since.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      if (event.cancelable) event.preventDefault();
      requestClose();
    };
    const onClose = () => {
      if (!dialog.open) requestClose();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [requestClose]);

  const context = useMemo<DialogContextValue>(
    () => ({ titleId: `${id}-title`, descriptionId: `${id}-description`, setDescribed, close: requestClose }),
    [id, requestClose],
  );
  return (
    <dialog
      {...rest}
      id={id}
      ref={composeRefs(dialogRef, ref)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : context.titleId}
      aria-describedby={described ? context.descriptionId : undefined}
      data-state={open ? "open" : "closed"}
    >
      <DialogContext.Provider value={context}>{children}</DialogContext.Provider>
    </dialog>
  );
};

/** The dialog's title; names it through `aria-labelledby`. */
const DialogBaseTitle = (props: DialogBaseTitleProps): ReactElement => {
  const { titleId } = useDialog("Title");
  return <h2 {...props} id={titleId} data-part="title" />;
};

/** Optional description, referenced by `aria-describedby` while mounted. */
const DialogBaseDescription = (props: DialogBaseDescriptionProps): ReactElement => {
  const { descriptionId, setDescribed } = useDialog("Description");
  useLayoutEffect(() => {
    setDescribed(true);
    return () => setDescribed(false);
  }, [setDescribed]);
  return <p {...props} id={descriptionId} data-part="description" />;
};

/** A native button that closes the dialog; the consumer's handler runs first and can prevent it. */
const DialogBaseClose = ({ onClick, ...props }: DialogBaseCloseProps): ReactElement => {
  const { close } = useDialog("Close");
  return (
    <button
      {...props}
      type="button"
      data-part="close"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
    />
  );
};

DialogBaseRoot.displayName = "DialogBase";
DialogBaseTitle.displayName = "DialogBase.Title";
DialogBaseDescription.displayName = "DialogBase.Description";
DialogBaseClose.displayName = "DialogBase.Close";

export const DialogBase = Object.assign(DialogBaseRoot, { Title: DialogBaseTitle, Description: DialogBaseDescription, Close: DialogBaseClose });
export { DialogBaseClose, DialogBaseDescription, DialogBaseTitle };
