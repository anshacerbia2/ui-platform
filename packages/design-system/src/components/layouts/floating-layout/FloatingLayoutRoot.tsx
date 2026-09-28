import { FloatingLayoutBaseRoot } from "@scnx/core-ui/components/floating-layout-base";

import type { FloatingLayoutProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Root container for the FloatingLayout.
 * Wraps `@scnx/core-ui/floating-layout-base`.
 * 
 * @example
 * ```tsx
 * import { FloatingLayout } from "@scnx/system/floating-layout";
 * 
 * <FloatingLayout.Root>...</FloatingLayout.Root>
 * ```
 */
export const FloatingLayoutRoot = ({ className = "", ...rest }: FloatingLayoutProps) => {
  return (
    <FloatingLayoutBaseRoot 
      className={cx("scnx-floating-layout", className)} 
      {...rest} 
    />
  );
};

FloatingLayoutRoot.displayName = "FloatingLayoutRoot";
