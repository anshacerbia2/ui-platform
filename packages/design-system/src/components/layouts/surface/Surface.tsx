import { BoxBase, type BoxBaseProps, type LayoutTag } from "@scnx/core-ui/components/box-base";
import { cx } from "styled-system/css";
import type { SurfaceProps } from "./types";

/**
 * Surface - one on-page material (ADR-UIP-VIS-001 item 1): `flat`, `raised`,
 * `panel`, or `well`, each a fill, a radius, and an edge bound together, never
 * a hand-made border and shadow. Renders a `div`, or one tag of the closed
 * LayoutTag union through `as`; its children are the consumer's.
 *
 * Nest concentrically and keep one shadow per stack: a card inside a panel is
 * `flat`, and a raised surface holds a `well` or a `flat` one, not another
 * raised one.
 *
 * @example
 * ```tsx
 * import { Surface } from "@scnx/system/components/surface";
 *
 * <Surface as="section" material="panel" padding="compact" aria-labelledby="usage">
 *   <Surface material="flat" padding="default">...</Surface>
 * </Surface>
 * ```
 */
export const Surface = <T extends LayoutTag = "div">({ material = "raised", padding = "none", className, ...rest }: SurfaceProps<T>) => (
  <BoxBase
    className={cx("scnx-surface", className)}
    data-material={material}
    data-padding={padding}
    {...(rest as BoxBaseProps<T>)}
  />
);

Surface.displayName = "Surface";
