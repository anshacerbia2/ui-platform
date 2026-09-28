import type { FloatingLayoutBaseContentProps } from "./types";

/**
 * Main content area for the floating layout.
 * Renders a semantic `<main>` element.
 *
 * @example
 * ```tsx
 * <FloatingLayoutBase.Root>
 *   <FloatingLayoutBase.Content>
 *     <h2>Floating Content</h2>
 *   </FloatingLayoutBase.Content>
 * </FloatingLayoutBase.Root>
 * ```
 */
export const FloatingLayoutBaseContent = ({
  ...rest
}: FloatingLayoutBaseContentProps) => {
  return (
    <main data-slot="content" {...rest} />
  );
};

FloatingLayoutBaseContent.displayName = "FloatingLayoutBaseContent";
