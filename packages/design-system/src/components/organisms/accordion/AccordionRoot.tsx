import { CollapsibleBaseRoot } from "@scnx/core-ui/components/collapsible-base";
import type { AccordionRootProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Accordion - Root component.
 * Acts as the registry provider for accordion items.
 */
export const AccordionRoot = ({
  className,
  disabledAnimations = false,
  ...rest
}: AccordionRootProps) => {
  return (
    <CollapsibleBaseRoot
      className={cx("scnx-accordion", className)}
      disabledAnimations={disabledAnimations}
      {...rest}
    />
  );
};

AccordionRoot.displayName = "Accordion";

