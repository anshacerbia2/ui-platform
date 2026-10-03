import { DisclosureItemProvider, useDisclosureItem } from "../disclosure-base/DisclosureContext";
import type { CollapsibleBaseItemProps } from "./types";

const ItemElement = ({ children, ...rest }: Omit<CollapsibleBaseItemProps, "value" | "open" | "defaultOpen" | "onOpenChange" | "disabled">) => {
  const { open, disabled } = useDisclosureItem("CollapsibleBase.Item");
  return (
    <div data-state={open ? "open" : "closed"} data-disabled={disabled ? "" : undefined} {...rest}>
      {children}
    </div>
  );
};

/** CollapsibleBaseItem - one disclosure: a trigger that controls one content region. */
export const CollapsibleBaseItem = ({ value, open, defaultOpen, onOpenChange, disabled, ...rest }: CollapsibleBaseItemProps) => (
  <DisclosureItemProvider value={value} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} disabled={disabled}>
    <ItemElement {...rest} />
  </DisclosureItemProvider>
);

CollapsibleBaseItem.displayName = "CollapsibleBaseItem";
