import { useEffect, useState } from "react";
import { useDisclosureItem } from "../disclosure-base/DisclosureContext";
import { TransitionBase } from "../transition-base";
import type { CollapsibleBaseContentProps } from "./types";

/**
 * CollapsibleBaseContent - the region a trigger controls (`role="region"`,
 * labelled by its trigger). It mounts when the item opens and unmounts when
 * its close transition settles; the logical open state never waits for the
 * animation (TDD primitives, Controlled-state reducer step 6).
 */
export const CollapsibleBaseContent = ({ children, forceMount = false, region = true, ...rest }: CollapsibleBaseContentProps) => {
  const { open, triggerId, contentId, disabledAnimations } = useDisclosureItem("CollapsibleBase.Content");
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  if (!open && !present && !forceMount) return null;
  return (
    <TransitionBase
      {...rest}
      id={contentId}
      role={region ? "region" : undefined}
      aria-labelledby={region ? triggerId : undefined}
      hidden={!open && !present ? true : undefined}
      open={open}
      disabled={disabledAnimations}
      onClosed={() => setPresent(false)}
      styleFrom={{ height: 0, opacity: 0, overflow: "hidden" }}
      styleTo={{ height: "auto", opacity: 1, overflow: "visible" }}
    >
      {children}
    </TransitionBase>
  );
};

CollapsibleBaseContent.displayName = "CollapsibleBaseContent";
