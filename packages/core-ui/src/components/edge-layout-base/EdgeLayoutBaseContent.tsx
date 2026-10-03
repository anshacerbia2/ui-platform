import type { EdgeLayoutBaseContentProps } from "./types";
import { useEdgeLayoutContext } from "./EdgeLayoutContext";

/**
 * Main content area for the edge layout.
 * Renders a semantic `<main>` element.
 */
export const EdgeLayoutBaseContent = ({
  ...rest
}: EdgeLayoutBaseContentProps) => {
  useEdgeLayoutContext("Content");

  return (
    <main data-slot="content" {...rest} />
  );
};

EdgeLayoutBaseContent.displayName = "EdgeLayoutBaseContent";
