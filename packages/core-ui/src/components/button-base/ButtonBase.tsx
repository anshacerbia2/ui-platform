import type { MouseEvent, ReactElement } from "react";
import { Slot } from "../../utils/Slot";
import type { AnchorModeProps, ButtonBaseProps, ButtonModeProps, ChildModeProps } from "./types";

/** Disabled link activation: cancelled, but the event still propagates. */
const cancelActivation = (event: MouseEvent) => event.preventDefault();

/**
 * ButtonBase - an action or a link with button styling hooks (TDD primitives,
 * API / Interface: Button).
 *
 * - Default: a native `<button type="button">`; `pressed` adds `aria-pressed`.
 * - `href`: a native `<a href>` that keeps link semantics (no `role="button"`).
 *   Disabled, it has no `href`, carries `aria-disabled`, leaves sequential
 *   focus, and cancels activation without stopping propagation.
 * - `asChild`: renders its single child (for example a router Link) with the
 *   same semantics; the child's own handler runs first.
 *
 * @example
 * ```tsx
 * <ButtonBase onClick={save}>Save</ButtonBase>
 * <ButtonBase href="/reports">Reports</ButtonBase>
 * <ButtonBase asChild><RouterLink to="/reports">Reports</RouterLink></ButtonBase>
 * ```
 */
export const ButtonBase = (props: ButtonBaseProps): ReactElement => {
  if (props.asChild) {
    const { asChild: _, disabled, ...rest } = props as ChildModeProps;
    const guard = disabled ? { "aria-disabled": true, tabIndex: -1, onClick: cancelActivation, "data-disabled": "" } : {};
    return <Slot {...rest} {...guard} />;
  }

  if (typeof props.href === "string") {
    const { disabled, href, onClick, ...rest } = props as AnchorModeProps;
    if (disabled) {
      return <a {...rest} aria-disabled tabIndex={-1} data-disabled="" onClick={cancelActivation} />;
    }
    return <a {...rest} href={href} onClick={onClick} />;
  }

  const { type = "button", pressed, ...rest } = props as ButtonModeProps;
  return <button {...rest} type={type} aria-pressed={typeof pressed === "boolean" ? pressed : undefined} />;
};

ButtonBase.displayName = "ButtonBase";
