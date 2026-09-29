import { EdgeLayoutBaseRoot } from "@scnx/core-ui/components/edge-layout-base";

import type { EdgeLayoutRootProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Root component for the EdgeLayout.
 * Renders the main container with `@scnx/core-ui/components/edge-layout-base`.
 * 
 * @example
 * ```tsx
 * import { EdgeLayout } from "@scnx/system/components/edge-layout";
 * 
 * <EdgeLayout.Root>...</EdgeLayout.Root>
 * ```
 */
export const EdgeLayoutRoot = ({
  children,
  className = "",
  ...rest
}: EdgeLayoutRootProps) => {
  return (
    <EdgeLayoutBaseRoot
      className={cx("scnx-edge-layout", className)}
      {...rest}
    >
      {children}
    </EdgeLayoutBaseRoot>
  );
};

EdgeLayoutRoot.displayName = "EdgeLayoutRoot";
