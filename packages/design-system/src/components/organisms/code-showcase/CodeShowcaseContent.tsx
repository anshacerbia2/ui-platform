"use client";

import { CodeShowcaseBaseContent } from "@scnx/core-ui/components/code-showcase-base";
import type { CodeShowcaseBaseContentProps } from "@scnx/core-ui/components/code-showcase-base";
import { cx } from "styled-system/css";

/**
 * CodeShowcaseContent - Styled content with high-performance transition orchestration.
 */
export const CodeShowcaseContent = ({
  children,
  className,
  ...rest
}: CodeShowcaseBaseContentProps) => {
  return (
    <CodeShowcaseBaseContent 
      className={cx("scnx-code-showcase__content", className)}
      {...rest}
    >
      {children}
    </CodeShowcaseBaseContent>
  );
};

CodeShowcaseContent.displayName = "CodeShowcaseContent";
