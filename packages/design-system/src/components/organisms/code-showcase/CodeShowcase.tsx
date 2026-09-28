import type { CodeShowcaseRootProps } from "./types";
import { CodeShowcaseRoot } from "./CodeShowcaseRoot";
import { CodeShowcaseNav } from "./CodeShowcaseNav";
import { CodeShowcasePreview } from "./CodeShowcasePreview";
import { CodeShowcaseTrigger } from "./CodeShowcaseTrigger";
import { CodeShowcaseContent } from "./CodeShowcaseContent";



const CodeShowcaseCompound = (props: CodeShowcaseRootProps) => <CodeShowcaseRoot {...props} />;


CodeShowcaseCompound.displayName = "CodeShowcase";

/**
 * CodeShowcase - The design system organism for exhibiting code snippets.
 * Aligned with CodeShowcaseBase primitives for structural consistency.
 */
export const CodeShowcase = Object.assign(CodeShowcaseCompound, {
  Nav: CodeShowcaseNav,
  Preview: CodeShowcasePreview,
  Trigger: CodeShowcaseTrigger,
  Content: CodeShowcaseContent,
});
