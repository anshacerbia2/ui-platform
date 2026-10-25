import { RadioGroupBase } from "@scnx/core-ui/components/radio-group-base";

import type { SegmentedControlProps } from "./types";
import { cx } from "styled-system/css";

const SegmentedControlRoot = ({ size = "medium", className = "", ...rest }: SegmentedControlProps) => (
  <RadioGroupBase {...rest} className={cx("scnx-segmented-control", className)} data-size={size} />
);
SegmentedControlRoot.displayName = "SegmentedControl";

/**
 * Switches between two to five peer views or values in place: a tonal well
 * whose checked segment is a raised thumb. Selection among peers is raised,
 * never the primary color, which marks location and checked state elsewhere.
 * Wraps `@scnx/core-ui/components/radio-group-base` (native radios, TDD
 * primitives P28), so Tab enters at the checked segment and arrow keys move
 * and check. For panels with their own content and focus order, use Tabs.
 *
 * @example
 * ```tsx
 * import { SegmentedControl } from "@scnx/system/components/segmented-control";
 *
 * <SegmentedControl aria-label="Range" value={range} onValueChange={setRange}>
 *   <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
 *   <SegmentedControl.Item value="7d">7 days</SegmentedControl.Item>
 *   <SegmentedControl.Item value="30d">30 days</SegmentedControl.Item>
 * </SegmentedControl>
 * ```
 */
export const SegmentedControl = Object.assign(SegmentedControlRoot, { Item: RadioGroupBase.Item });
