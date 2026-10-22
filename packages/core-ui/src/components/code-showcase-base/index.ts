"use client";

export type { 
  CodeShowcaseBaseRootProps, 
  CodeShowcaseBasePreviewProps,
  CodeShowcaseBaseNavProps, 
  CodeShowcaseBaseTriggerProps,
  CodeShowcaseBaseContentProps
} from "./types";

export { CodeShowcaseBase } from "./CodeShowcaseBase";
export { CodeShowcaseBaseRoot } from "./CodeShowcaseBaseRoot";
export { CodeShowcaseBasePreview } from "./CodeShowcaseBasePreview";
export { CodeShowcaseBaseNav } from "./CodeShowcaseBaseNav";
export { CodeShowcaseBaseTrigger } from "./CodeShowcaseBaseTrigger";
export { CodeShowcaseBaseContent } from "./CodeShowcaseBaseContent";

// Reached from this entry's public signatures (TDD packaging RC7).
export type {
  CollapsibleBaseContentProps,
  CollapsibleBaseItemProps,
  CollapsibleBaseRootProps,
  CollapsibleBaseTriggerProps,
} from "../collapsible-base/types";
export type {
  DisclosureItemOptions,
  DisclosureProviderProps,
} from "../disclosure-base/types";
