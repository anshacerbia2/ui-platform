import { CodeShowcaseBaseRoot } from "@scnx/core-ui/components/code-showcase-base";

import type { CodeShowcaseRootProps } from "./types";
import { cx } from "styled-system/css";

/**
 * CodeShowcaseRoot - Pure layout container for the CodeShowcase component.
 * Delegates execution and state to CodeShowcaseBaseRoot.
 */
export const CodeShowcaseRoot = ({
  className,
  children,
  disabledAnimations = false,
  defaultOpen = true,
  ...rest
}: CodeShowcaseRootProps) => {
  return (
    <CodeShowcaseBaseRoot 
      className={cx("scnx-code-showcase", className)} 
      disabledAnimations={disabledAnimations}
      defaultOpen={defaultOpen}
      {...rest}
    >
       {children}
    </CodeShowcaseBaseRoot>
  );
};
CodeShowcaseRoot.displayName = "CodeShowcase.Root";
