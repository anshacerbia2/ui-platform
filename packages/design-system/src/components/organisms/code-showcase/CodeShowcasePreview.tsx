import { CodeShowcaseBasePreview } from "@scnx/core-ui/components/code-showcase-base";

import type { CodeShowcasePreviewProps } from "./types";
import { cx } from "styled-system/css";

/**
 * CodeShowcasePreview - Styled container for component demos.
 * Built on top of CodeShowcaseBase.Preview primitive.
 */
export const CodeShowcasePreview = ({ 
  className, 
  children, 
  ...rest 
}: CodeShowcasePreviewProps) => (
  <CodeShowcaseBasePreview 
    className={cx("scnx-code-showcase__preview", className)} 
    {...rest}
  >
    {children}
  </CodeShowcaseBasePreview>
);

CodeShowcasePreview.displayName = "CodeShowcase.Preview";
