import { DisclosureProvider } from "../disclosure-base/DisclosureContext";
import type { CollapsibleBaseRootProps } from "./types";

/** CollapsibleBaseRoot - a disclosure scope; every root owns its own registry. */
export const CollapsibleBaseRoot = ({ type = "multiple", value, defaultValue, onValueChange, collapsible, disabled, disabledAnimations, ...rest }: CollapsibleBaseRootProps) => (
  <DisclosureProvider
    type={type}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    collapsible={collapsible}
    disabled={disabled}
    disabledAnimations={disabledAnimations}
  >
    <div data-type={type} data-disabled={disabled ? "" : undefined} {...rest} />
  </DisclosureProvider>
);

CollapsibleBaseRoot.displayName = "CollapsibleBaseRoot";
