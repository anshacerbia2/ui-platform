import type { CodeShowcaseBasePreviewProps } from "./types";

/**
 * CodeShowcaseBasePreview - Header slot for rendering a live component preview.
 * Strictly a layout container following the "Naked" philosophy.
 */
export const CodeShowcaseBasePreview = ({ ...rest }: CodeShowcaseBasePreviewProps) => (
  <div {...rest} />
);

CodeShowcaseBasePreview.displayName = "CodeShowcaseBase.Preview";
