import { LinkBase, type LinkBaseProps } from "@scnx/core-ui/components/link-base";
import { cx } from "styled-system/css";
import type { LinkProps } from "./types";

/**
 * Link - navigation in running text, on LinkBase: Scnx Blue text with a 1px
 * underline, so it reads as a link without relying on color (WCAG 2.2 SC
 * 1.4.1). It never carries a background or button padding; an action that
 * does not navigate is a Button.
 *
 * @example
 * ```tsx
 * import { Link } from "@scnx/system/components/link";
 *
 * <Link href="/changelog">Changelog</Link>
 * <Link href="https://www.npmjs.com/package/@scnx/system" external>npm package</Link>
 * <Link asChild variant="neutral"><RouterLink to="/terms">Terms</RouterLink></Link>
 * ```
 */
export const Link = ({ variant = "primary", className, ...rest }: LinkProps) => {
  const shared = { className: cx("scnx-link", className), "data-variant": variant };
  if (rest.asChild) return <LinkBase {...shared} {...(rest as LinkBaseProps)} />;
  const { external = false, children, ...anchor } = rest;
  return (
    <LinkBase {...shared} {...anchor}>
      {children}
      {external && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
        </svg>
      )}
    </LinkBase>
  );
};

Link.displayName = "Link";
