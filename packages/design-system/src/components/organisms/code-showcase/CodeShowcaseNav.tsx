import { CodeShowcaseBaseNav } from "@scnx/core-ui/components/code-showcase-base";

import type { CodeShowcaseNavProps } from "./types";
import { cx } from "styled-system/css";

/**
 * CodeShowcaseNav - The header container holding the tabs list and actions.
 */
export const CodeShowcaseNav = ({ 
  className, 
  ...rest 
}: CodeShowcaseNavProps) => (
  <CodeShowcaseBaseNav className={cx("scnx-code-showcase__nav", className)} {...rest} />
);
CodeShowcaseNav.displayName = "CodeShowcaseNav";
