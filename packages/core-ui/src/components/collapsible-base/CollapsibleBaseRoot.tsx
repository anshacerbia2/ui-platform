"use client";

import type { CollapsibleBaseRootProps } from "./types";
import {
  DisclosureProvider,
  useHasDisclosureContext,
} from "../disclosure-base/DisclosureContext";

/**
 * PATH 1: STANDALONE ROOT
 * Bikin Registry baru (Boss). Gak punya ID dan gak ngerender data-state.
 */
const CollapsibleStandaloneManager = ({
  type,
  defaultRegistry,
  registry,
  disabledAnimations,
  onRegistryChange,
  ...rest
}: CollapsibleBaseRootProps) => {
  return (
    <DisclosureProvider
      type={type}
      defaultRegistry={defaultRegistry}
      registry={registry}
      disabledAnimations={disabledAnimations}
      onRegistryChange={onRegistryChange}
    >
      <div {...rest} />
    </DisclosureProvider>
  );
};

/**
 * PATH 2: NESTED BRIDGE
 * Passthrough ke registry bapaknya. Gak perlu logic apapun, return div langsung.
 */
const CollapsibleRegistryBridge = (props: CollapsibleBaseRootProps) => (
  <div {...props} />
);

/**
 * ATOMIC DISPATCHER: CollapsibleBaseRoot
 */
export const CollapsibleBaseRoot = (props: CollapsibleBaseRootProps) => {
  const hasParentContext = useHasDisclosureContext();

  if (hasParentContext) {
    return <CollapsibleRegistryBridge {...props} />;
  }

  return <CollapsibleStandaloneManager {...props} />;
};

CollapsibleBaseRoot.displayName = "CollapsibleBaseRoot";
