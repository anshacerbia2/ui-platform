import type { ComponentPropsWithRef, ReactNode } from "react";

/**
 * Live-region role of an alert: `status` is polite, `alert` is assertive and
 * for an important, time-sensitive message inserted while the page is in use.
 */
export type AlertRole = "status" | "alert";

export type AlertBaseProps = {
  /** Custom CSS classes. */
  className?: string;
  /** The message. */
  children?: ReactNode;
  /** A short heading for the message, rendered before it. */
  title?: ReactNode;
  /** A decorative icon, hidden from assistive technology; the text carries the meaning. */
  icon?: ReactNode;
  /** Actions for the message: buttons or icon buttons, which meet the 24 px pointer target (WCAG 2.2 SC 2.5.8). */
  actions?: ReactNode;
  /** Live-region role. @default "status" */
  role?: AlertRole;
} & Omit<ComponentPropsWithRef<"div">, "title" | "role" | "children">;
