import type { CodeShowcaseBaseRootProps } from "./types";
import { CodeShowcaseBaseRoot } from "./CodeShowcaseBaseRoot";
import { CodeShowcaseBasePreview } from "./CodeShowcaseBasePreview";
import { CodeShowcaseBaseNav } from "./CodeShowcaseBaseNav";
import { CodeShowcaseBaseTrigger } from "./CodeShowcaseBaseTrigger";
import { CodeShowcaseBaseContent } from "./CodeShowcaseBaseContent";

/**
 * CodeShowcaseBase - The specialized headless container for code previews.
 * Organized as a compound component for clean composition.
 */
const CodeShowcaseBaseCompound = ({ ...rest }: CodeShowcaseBaseRootProps) => (
  <CodeShowcaseBaseRoot {...rest} />
);

CodeShowcaseBaseCompound.displayName = "CodeShowcaseBase";

export const CodeShowcaseBase = Object.assign(CodeShowcaseBaseCompound, {
  Preview: CodeShowcaseBasePreview,
  Nav: CodeShowcaseBaseNav,
  Trigger: CodeShowcaseBaseTrigger,
  Content: CodeShowcaseBaseContent,
});
