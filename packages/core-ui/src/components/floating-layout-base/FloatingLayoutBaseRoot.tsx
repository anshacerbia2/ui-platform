import type { FloatingLayoutBaseRootProps } from "./types";

/**
 * Root container for the floating layout system.
 * Typically used as the outermost layout wrapper.
 *
 * @example
 * ```tsx
 * import { FloatingLayoutBase } from "@scnx/core-ui/components/floating-layout-base";
 * 
 * <FloatingLayoutBase.Root className="overlay">
 *   <FloatingLayoutBase.Content>...</FloatingLayoutBase.Content>
 * </FloatingLayoutBase.Root>
 * ```
 */
export const FloatingLayoutBaseRoot = ({
  ...rest
}: FloatingLayoutBaseRootProps) => {
  return (
    <div {...rest} />
  );
};

FloatingLayoutBaseRoot.displayName = "FloatingLayoutBaseRoot";
