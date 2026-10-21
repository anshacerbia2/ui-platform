import type { CodeShowcaseTriggerProps } from "./types";
import { CodeShowcaseBaseTrigger } from "@scnx/core-ui/components/code-showcase-base";
import { cx } from "styled-system/css";

/**
 * CodeShowcaseTrigger - Styled trigger for design system showcase.
 * Delegates directly to the base primitive with full Render Props support.
 */
export const CodeShowcaseTrigger = ({ className, ...rest }: CodeShowcaseTriggerProps) => (
  <CodeShowcaseBaseTrigger className={cx("scnx-code-showcase__trigger", className)} {...rest} />
);

CodeShowcaseTrigger.displayName = "CodeShowcaseTrigger";
