import type { CollapsibleBaseRootProps } from "./types";
import { CollapsibleBaseRoot as Root } from "./CollapsibleBaseRoot";
import { CollapsibleBaseItem as Item } from "./CollapsibleBaseItem";
import { CollapsibleBaseTrigger as Trigger } from "./CollapsibleBaseTrigger";
import { CollapsibleBaseContent as Content } from "./CollapsibleBaseContent";

/**
 * CollapsibleBase — Headless disclosure primitive with pure compound API.
 */
const CollapsibleBaseCompound = (props: CollapsibleBaseRootProps) => (
  <Root {...props} />
);

CollapsibleBaseCompound.displayName = "CollapsibleBase";

export const CollapsibleBase = Object.assign(CollapsibleBaseCompound, {
  Item,
  Trigger,
  Content,
});






