import type { CodeProps } from "./types";
import { codeRecipe } from "styled-system/recipes";
import { cx } from "styled-system/css";

/**
 * Code - Tier 1 Atomic Component.
 * 
 * A premium atomic component for technical strings and design tokens.
 * Renders a semantic `<code>` element.
 * Enforces JetBrains Mono via the design system's mono font variable.
 *
 * @example
 * ```tsx
 * import { Code } from "@scnx/system/components/code";
 * 
 * <Code intent="primary">npm install @scnx/system</Code>
 * ```
 */
export const Code = ({ children, className, intent, ...rest }: CodeProps) => {
  return (
    <code className={cx(codeRecipe({ intent }), className)} {...rest}>
      {children}
    </code>
  );
};

Code.displayName = "Code";
