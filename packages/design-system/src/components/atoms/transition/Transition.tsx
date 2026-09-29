
import { TransitionBase } from "@scnx/core-ui/components/transition-base";

import type { TransitionProps } from "./types";
import { cx } from "styled-system/css";

/**
 * Transition - Tier 1 Atomic Component.
 * 
 * Styled transition wrapper using `@scnx/core-ui/components/transition-base`.
 * Provides entrance/exit animations for children.
 * Renders a semantic `<div>` element to manage visibility states.
 *
 * @example
 * ```tsx
 * import { Transition } from "@scnx/system/components/transition";
 * 
 * <Transition smoothClose={isOpen} styleFrom={{ opacity: 0 }} styleTo={{ opacity: 1 }}>
 *   <div>Animated Content</div>
 * </Transition>
 * ```
 */
export const Transition = ({
  className = "",
  ...rest
}: TransitionProps) => {
  return (
    <TransitionBase
      className={cx("scnx-transition", className)}
      {...rest}
    />
  );
};

Transition.displayName = "Transition";
