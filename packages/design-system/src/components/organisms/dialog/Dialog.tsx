import { DialogBase, DialogBaseClose, DialogBaseDescription, DialogBaseTitle, type DialogBaseCloseProps } from "@scnx/core-ui/components/dialog-base";

import type { DialogProps } from "./types";
import { cx } from "styled-system/css";

const DialogRoot = ({ className = "", ...rest }: DialogProps) => <DialogBase {...rest} className={cx("scnx-dialog", className)} />;
DialogRoot.displayName = "Dialog";

/** Close, styled as a Button (`variant` as in Button; secondary by default). */
const DialogClose = ({ className = "", variant = "secondary", ...rest }: DialogBaseCloseProps & { variant?: "primary" | "secondary" }) => (
  <DialogBaseClose {...rest} className={cx("scnx-btn", className)} data-variant={variant} />
);
DialogClose.displayName = "Dialog.Close";

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
 *   <Dialog.Close>Cancel</Dialog.Close>
 * </Dialog>
 * ```
 */
export const Dialog = Object.assign(DialogRoot, { Title: DialogBaseTitle, Description: DialogBaseDescription, Close: DialogClose });
