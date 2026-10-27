import { cx } from "styled-system/css";
import type { SpinnerProps } from "./types";

/**
 * Spinner - work of unknown length is in progress. With a `label` it is a
 * polite status that announces what is loading; without one it is hidden from
 * assistive technology, for a control whose own label already says so. Show it
 * only after about 400ms; a known quantity is a Progress, a loading layout a
 * Skeleton.
 *
 * @example
 * ```tsx
 * import { Spinner } from "@scnx/system/components/spinner";
 *
 * <Spinner label="Loading deployments" />
 * <Button disabled><Spinner /> Saving…</Button>
 * ```
 */
export const Spinner = ({ label, size = "small", className, ...rest }: SpinnerProps) =>
  label ? (
    <span {...rest} className={cx("scnx-spinner", className)} data-size={size} role="status">
      <span data-part="label">{label}</span>
    </span>
  ) : (
    <span {...rest} className={cx("scnx-spinner", className)} data-size={size} aria-hidden="true" />
  );

Spinner.displayName = "Spinner";
