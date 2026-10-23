import type { ReactElement } from "react";
import type { AlertBaseProps } from "./types";

/**
 * AlertBase - a message in a live region (TDD primitives P26).
 *
 * - `role="status"` by default, a polite live region (Carbon's notifications
 *   default to it); `role="alert"` only for an important, time-sensitive
 *   message inserted while the page is in use, since screen readers do not
 *   announce an alert present before the page loads (APG Alert pattern).
 * - Never moves focus. The icon is decorative (`aria-hidden`); the title and
 *   the message carry the meaning, so color is never the only cue.
 * - Parts: `icon`, `content` (holding `title` and `body`), and `actions`,
 *   each rendered only when given, as `data-part` hooks for styling.
 *
 * @example
 * ```tsx
 * <AlertBase title="Saved">Your changes are live.</AlertBase>
 * <AlertBase role="alert" title="Payment failed">Check the card and retry.</AlertBase>
 * ```
 */
export const AlertBase = ({ role = "status", title, icon, actions, children, ...rest }: AlertBaseProps): ReactElement => (
  <div {...rest} role={role}>
    {icon != null && (
      <span data-part="icon" aria-hidden="true">
        {icon}
      </span>
    )}
    <div data-part="content">
      {title != null && <div data-part="title">{title}</div>}
      {children != null && <div data-part="body">{children}</div>}
    </div>
    {actions != null && <div data-part="actions">{actions}</div>}
  </div>
);

AlertBase.displayName = "AlertBase";
