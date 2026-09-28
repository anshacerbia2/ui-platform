import type { CodeShowcaseBaseTriggerProps } from "./types";
import { CollapsibleBaseTrigger } from "../collapsible-base";

/**
 * CodeShowcaseBaseTrigger - Specialized trigger for code showcase.
 * Delegates to CollapsibleBase.Trigger.
 */
export const CodeShowcaseBaseTrigger = ({ children, ...rest }: CodeShowcaseBaseTriggerProps) => (
  <CollapsibleBaseTrigger {...rest}>
    {children}
  </CollapsibleBaseTrigger>
);

CodeShowcaseBaseTrigger.displayName = "CodeShowcaseBaseTrigger";
