import { cx } from "styled-system/css";
import type { SkeletonProps } from "./types";

/**
 * Skeleton - holds the shape of content that is loading, so the layout does
 * not jump. It is hidden from assistive technology; mark the loading region
 * `aria-busy="true"` and give it a name. Size each skeleton like the content it
 * replaces, never as a generic grey card.
 *
 * Size it with a class, not an inline `style`: under a strict Content Security
 * Policy (a nonce, without `'unsafe-inline'`), the browser blocks a `style`
 * attribute rendered on the server.
 *
 * @example
 * ```tsx
 * import { Skeleton } from "@scnx/system/components/skeleton";
 *
 * // consumer CSS (no inline style)
 * // .deploy-avatar { inline-size: 2rem; }
 * // .deploy-name { inline-size: 12rem; }
 *
 * <section aria-busy="true" aria-label="Deployments">
 *   <Skeleton shape="circle" className="deploy-avatar" />
 *   <Skeleton className="deploy-name" />
 * </section>
 * ```
 */
export const Skeleton = ({ shape = "text", className, ...rest }: SkeletonProps) => (
  <span {...rest} className={cx("scnx-skeleton", className)} data-shape={shape} aria-hidden="true" />
);

Skeleton.displayName = "Skeleton";
