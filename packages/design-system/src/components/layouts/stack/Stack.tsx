import type { StackProps } from "./types";
import { cx } from "styled-system/css";
import { Flex } from "../flex";

/**
 * Stack - Vertical Layout Component
 * 
 * Syntactic sugar for `<Flex direction="col">`.
 * Ensures predictable, frictionless vertical stacking for forms, cards, and column lists.
 * Enforces standardized UI spacing when mapped with a `gap` macro.
 *
 * @example
 * ```tsx
 * import { Stack } from "@scnx/system/components/layouts/stack";
 * 
 * <Stack gap="4">
 *   <input type="text" />
 *   <button>Submit</button>
 * </Stack>
 * ```
 */
export const Stack = ({ className, ...rest }: StackProps) => {
  return (
    <Flex direction="col" className={cx("scnx-stack", className)} {...rest} />
  );
};

Stack.displayName = "Stack";
