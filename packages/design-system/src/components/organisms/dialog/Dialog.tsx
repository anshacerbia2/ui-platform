import { DialogBase, DialogBaseClose, DialogBaseDescription, DialogBaseTitle, type DialogBaseCloseProps } from "@scnx/core-ui/components/dialog-base";
import type { ComponentPropsWithRef } from "react";

import type { DialogProps } from "./types";
import { cx } from "styled-system/css";

const DialogRoot = ({ className = "", ...rest }: DialogProps) => <DialogBase {...rest} className={cx("scnx-dialog", className)} />;
DialogRoot.displayName = "Dialog";

/** Close, styled as a Button (`variant` as in Button; secondary by default). */
const DialogClose = ({ className = "", variant = "secondary", ...rest }: DialogBaseCloseProps & { variant?: "primary" | "secondary" | "ghost" | "danger" }) => (
  <DialogBaseClose {...rest} className={cx("scnx-btn", className)} data-variant={variant} />
);
DialogClose.displayName = "Dialog.Close";

/** The dialog's content between the description and the actions (TDD styled DG2). */
const DialogBody = (props: ComponentPropsWithRef<"div">) => <div {...props} data-part="body" />;
DialogBody.displayName = "Dialog.Body";

/** The row of actions at the end edge: dismiss first, the confirming action last (TDD styled DG2). */
const DialogActions = (props: ComponentPropsWithRef<"div">) => <div {...props} data-part="actions" />;
DialogActions.displayName = "Dialog.Actions";

/**
 * The close control in the top-end corner, a small ghost IconButton (TDD
 * styled DG3). Its accessible name defaults to "Close".
 */
const DialogCloseButton = ({ className = "", "aria-label": ariaLabel = "Close", ...rest }: Omit<DialogBaseCloseProps, "children">) => (
  <DialogBaseClose {...rest} aria-label={ariaLabel} className={cx("scnx-icon-btn", className)} data-variant="ghost" data-size="small" data-corner="">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </DialogBaseClose>
);
DialogCloseButton.displayName = "Dialog.CloseButton";

/**
 * Styled modal dialog on the native `<dialog>` element. Wraps
 * `@scnx/core-ui/components/dialog-base` (TDD primitives P16): it opens only
 * through `showModal()`, the page behind is inert, and focus returns to the
 * opener on close.
 *
 * @example
 * ```tsx
 * import { Dialog } from "@scnx/system/components/dialog";
 *
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <Dialog.Title>Delete the payroll run?</Dialog.Title>
 *   <Dialog.Description>The run and its payslips are removed.</Dialog.Description>
 *   <Dialog.Actions>
 *     <Dialog.Close variant="ghost">Cancel</Dialog.Close>
 *     <Button variant="danger" onClick={remove}>Delete run</Button>
 *   </Dialog.Actions>
 *   <Dialog.CloseButton />
 * </Dialog>
 * ```
 */
export const Dialog = Object.assign(DialogRoot, {
  Title: DialogBaseTitle,
  Description: DialogBaseDescription,
  Body: DialogBody,
  Actions: DialogActions,
  Close: DialogClose,
  CloseButton: DialogCloseButton,
});
