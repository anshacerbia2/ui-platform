import { EdgeLayoutBaseContent } from "@scnx/core-ui/components/edge-layout-base";

import type { EdgeLayoutContentProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Content area for the EdgeLayout.
 * Renders the scrollable content zone with `@scnx/core-ui/edge-layout-base`.
 * 
 * @throws Warns in development if rendered outside of `EdgeLayout.Root`.
 * 
 * @example
 * ```tsx
 * import { EdgeLayout } from "@scnx/system/edge-layout";
 * 
 * <EdgeLayout.Content>...</EdgeLayout.Content>
 * ```
 */
export const EdgeLayoutContent = ({
  className = "",
  ...rest
}: EdgeLayoutContentProps) => {
  return (
    <EdgeLayoutBaseContent
      className={cx("scnx-edge-layout__content", className)}
      {...rest}
    />
  );
};

EdgeLayoutContent.displayName = "EdgeLayoutContent";
