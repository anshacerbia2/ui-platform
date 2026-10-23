import { AlertBase } from "@scnx/core-ui/components/alert-base";

import type { AlertProps } from "./types";
import { cx } from "styled-system/css";

/**
 * An inline message about the page or a task. Wraps
 * `@scnx/core-ui/components/alert-base`: a polite `status` region by
 * default, `role="alert"` for an important message inserted while the page is
 * in use, and never a focus change.
 *
 * @example
 * ```tsx
 * import { Alert } from "@scnx/system/components/alert";
 *
 * <Alert scheme="success" title="Deployed">Version 2.0 is live.</Alert>
 * <Alert scheme="danger" role="alert" title="Payment failed">Check the card and retry.</Alert>
 * ```
 */
export const Alert = ({ scheme = "info", className = "", ...rest }: AlertProps) => (
  <AlertBase {...rest} className={cx("scnx-alert", className)} data-scheme={scheme} />
);

Alert.displayName = "Alert";
