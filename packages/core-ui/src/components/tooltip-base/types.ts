import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../../utils/floating/position";
import type { OpenStateProps } from "../../utils/floating/useOpenState";

export type TooltipBasePlacement = FloatingPlacement;

export type TooltipBaseProps = OpenStateProps & {
  /** Milliseconds a pointer rests on the trigger before the tooltip opens; keyboard focus opens it at once. @default 400 */
  delay?: number;
  /** The side of the trigger the tooltip takes; it flips when that side has no room. @default "top" */
  placement?: TooltipBasePlacement;
  children?: ReactNode;
};

/** The trigger is its single child element, which must be focusable (a button or a link). */
export type TooltipBaseTriggerProps = {
  children: ReactElement;
};

/** The tooltip: a few words that name or explain the trigger, never interactive content. */
export type TooltipBaseContentProps = Omit<ComponentPropsWithRef<"div">, "role" | "id">;
