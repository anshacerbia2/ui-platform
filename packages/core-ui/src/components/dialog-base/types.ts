import type { ComponentPropsWithRef } from "react";

export type DialogBaseProps = Omit<ComponentPropsWithRef<"dialog">, "open" | "aria-labelledby" | "aria-describedby" | "aria-modal"> & {
  /** Whether the dialog is open. It opens only through `showModal()`, never the `open` attribute (TDD primitives P16). */
  open: boolean;
  /** Called with `false` whenever the dialog closes: Escape, `DialogBase.Close`, a `method="dialog"` form, or `open` set to false. */
  onOpenChange: (open: boolean) => void;
  /** Accessible name when the dialog has no `DialogBase.Title`. */
  "aria-label"?: string;
};

export type DialogBaseTitleProps = Omit<ComponentPropsWithRef<"h2">, "id">;
export type DialogBaseDescriptionProps = Omit<ComponentPropsWithRef<"p">, "id">;
export type DialogBaseCloseProps = Omit<ComponentPropsWithRef<"button">, "type">;
