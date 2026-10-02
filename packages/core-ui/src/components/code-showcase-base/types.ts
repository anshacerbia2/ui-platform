import type { ComponentPropsWithRef } from "react";
import type {
  CollapsibleBaseContentProps,
  CollapsibleBaseItemProps,
  CollapsibleBaseRootProps,
  CollapsibleBaseTriggerProps,
} from "../collapsible-base/types";

/** A code showcase is one disclosure: the code region and the trigger that shows it. */
export type CodeShowcaseBaseRootProps = Omit<CollapsibleBaseRootProps, "type" | "value" | "defaultValue" | "onValueChange" | "collapsible"> &
  Pick<CollapsibleBaseItemProps, "open" | "defaultOpen" | "onOpenChange">;
export type CodeShowcaseBasePreviewProps = ComponentPropsWithRef<"div">;
export type CodeShowcaseBaseNavProps = ComponentPropsWithRef<"div">;
export type CodeShowcaseBaseTriggerProps = CollapsibleBaseTriggerProps;
export type CodeShowcaseBaseContentProps = CollapsibleBaseContentProps;
