import type { ComponentPropsWithRef } from "react";
import type { 
  CollapsibleBaseRootProps,
  CollapsibleBaseTriggerProps,
  CollapsibleBaseContentProps,
  CollapsibleBaseItemProps
} from "../collapsible-base/types";

export type CodeShowcaseBaseRootProps = CollapsibleBaseRootProps & Pick<CollapsibleBaseItemProps, "isOpen" | "defaultOpen" | "onOpenChange">;
export type CodeShowcaseBasePreviewProps = CodeShowcaseBaseRootProps;
export type CodeShowcaseBaseNavProps = ComponentPropsWithRef<"div">;
export type CodeShowcaseBaseTriggerProps = CollapsibleBaseTriggerProps;
export type CodeShowcaseBaseContentProps = CollapsibleBaseContentProps;
