import type { CodeShowcaseBaseRootProps } from "./types";
import { CollapsibleBaseRoot, CollapsibleBaseItem } from "../collapsible-base";

/**
 * CodeShowcaseBaseRoot - Pure Headless layout container for code previews.
 * Built on top of CollapsibleBase to inherit state and transition logic.
 */
export const CodeShowcaseBaseRoot = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  ...rest
}: CodeShowcaseBaseRootProps) => (
  <CollapsibleBaseRoot {...rest}>
    <CollapsibleBaseItem
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </CollapsibleBaseItem>
  </CollapsibleBaseRoot>
);

CodeShowcaseBaseRoot.displayName = "CodeShowcaseBaseRoot";
