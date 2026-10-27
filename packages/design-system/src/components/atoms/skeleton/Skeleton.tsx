import { cx } from "styled-system/css";
import type { SkeletonProps } from "./types";

/**
 * Skeleton - holds the shape of content that is loading, so the layout does
 * not jump. It is hidden from assistive technology; mark the loading region
 * `aria-busy="true"` and give it a name. Size each skeleton like the content it
 * replaces, never as a generic grey card.
 *
 * @example
 * ```tsx
 * import { Skeleton } from "@scnx/system/components/skeleton";
 *
 * <section aria-busy="true" aria-label="Deployments">
 *   <Skeleton shape="circle" style={{ inlineSize: "2rem" }} />
 *   <Skeleton style={{ inlineSize: "60%" }} />
 * </section>
 * ```
 */
export const Skeleton = ({ shape = "text", className, ...rest }: SkeletonProps) => (
  <span {...rest} className={cx("scnx-skeleton", className)} data-shape={shape} aria-hidden="true" />
);

Skeleton.displayName = "Skeleton";
