
import { DividerBase } from "@scnx/core-ui/components/divider-base";
import "./Divider.scss";

import type { DividerProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Divider - Tier 1 Atomic Component.
 * 
 * Styled horizontal or vertical divider.
 * Wraps `@scnx/core-ui/components/divider-base`.
 * Renders a semantic `<div>` with `role="separator"`.
 *
 * @example
 * ```tsx
 * import { Divider } from "@scnx/system/components/divider";
 * 
 * <Divider />
 * <Divider orientation="vertical" />
 * ```
 */
export const Divider = ({ className = "", ...rest }: DividerProps) => {
  return (
    <DividerBase
      className={cx("scnx-divider", className)}
      {...rest}
    />
  );
};

Divider.displayName = "Divider";
