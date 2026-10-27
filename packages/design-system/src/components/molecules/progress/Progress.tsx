import { useId } from "react";
import { cx } from "styled-system/css";
import type { ProgressProps } from "./types";

/**
 * Progress - how far a known quantity has gone: a visible label and value over
 * a 6px pill track. The bar is a native `progress` element (`role` progressbar),
 * so its value is an attribute, never a style, and the markup holds under a
 * strict CSP (TDD theme THM-009). It is named by its label and reads the
 * formatted value. Unknown duration is a Spinner.
 *
 * @example
 * ```tsx
 * import { Progress } from "@scnx/system/components/progress";
 *
 * <Progress label="Storage" value={7.2} max={10} valueText="7.2 of 10 GB" />
 * ```
 */
export const Progress = ({ value, max = 100, label, valueText, scheme = "primary", className, ...rest }: ProgressProps) => {
  const labelId = useId();
  return (
    <div {...rest} className={cx("scnx-progress", className)} data-scheme={scheme}>
      <div data-part="header">
        <span data-part="label" id={labelId}>
          {label}
        </span>
        {valueText && (
          <span data-part="value" aria-hidden="true">
            {valueText}
          </span>
        )}
      </div>
      <progress data-part="track" value={Math.min(Math.max(value, 0), max)} max={max} aria-labelledby={labelId} aria-valuetext={valueText} />
    </div>
  );
};

Progress.displayName = "Progress";
