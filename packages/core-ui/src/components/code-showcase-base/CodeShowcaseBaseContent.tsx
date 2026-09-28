import type { CodeShowcaseBaseContentProps } from "./types";
import { CollapsibleBaseContent } from "../collapsible-base";

/**
 * CodeShowcaseBaseContent - Headless transition wrapper for code content.
 * Delegates animation logic to CollapsibleBase.Content.
 */
export const CodeShowcaseBaseContent = ({...rest}: CodeShowcaseBaseContentProps) => (
  <CollapsibleBaseContent {...rest} />
);

CodeShowcaseBaseContent.displayName = "CodeShowcaseBaseContent";
