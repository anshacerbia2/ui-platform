import type { CodeShowcaseBaseRootProps } from "./types";

/**
 * CodeShowcaseBasePreview - Header slot for rendering a live component preview.
 * Strictly a layout container following the "Naked" philosophy.
 */
export const CodeShowcaseBasePreview = ({ ...rest }: CodeShowcaseBaseRootProps) => (
  <div {...rest} />
);

CodeShowcaseBasePreview.displayName = "CodeShowcaseBase.Preview";
