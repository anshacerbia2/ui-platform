import { FloatingLayoutBaseContent } from "@scnx/core-ui/components/floating-layout-base";

import type { FloatingLayoutContentProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Content container for the FloatingLayout.
 * Renders the main content with `@scnx/core-ui/components/floating-layout-base`.
 * 
 * @example
 * ```tsx
 * import { FloatingLayout } from "@scnx/system/components/floating-layout";
 * 
 * <FloatingLayout.Content>...</FloatingLayout.Content>
 * ```
 */
export const FloatingLayoutContent = ({ className = "", ...rest }: FloatingLayoutContentProps) => {
  return (
    <FloatingLayoutBaseContent className={cx("scnx-floating-layout__content", className)} {...rest} />
  );
};

FloatingLayoutContent.displayName = "FloatingLayoutContent";
