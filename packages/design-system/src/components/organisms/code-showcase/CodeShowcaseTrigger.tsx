import type { CodeShowcaseTriggerProps } from "./types";
import { CodeShowcaseBaseTrigger } from "@scnx/core-ui/components/code-showcase-base";

/**
 * CodeShowcaseTrigger - Styled trigger for design system showcase.
 * Delegates directly to the base primitive with full Render Props support.
 */
export const CodeShowcaseTrigger = ({ children, ...rest}: CodeShowcaseTriggerProps) => (
  <CodeShowcaseBaseTrigger {...rest}>
    {children as any}
  </CodeShowcaseBaseTrigger>
);

CodeShowcaseTrigger.displayName = "CodeShowcaseTrigger";
