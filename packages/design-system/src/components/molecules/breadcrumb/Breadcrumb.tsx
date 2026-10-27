import { LinkBase, type LinkBaseProps } from "@scnx/core-ui/components/link-base";
import { cx } from "styled-system/css";
import type { BreadcrumbItemProps, BreadcrumbLinkProps, BreadcrumbPageProps, BreadcrumbProps } from "./types";

/**
 * Breadcrumb - where the page sits in the hierarchy (APG breadcrumb pattern):
 * a `nav` landmark named "Breadcrumb" by default, holding an ordered list of
 * ancestor links and, last, the current page with `aria-current="page"` and no
 * link. Separators are drawn by the stylesheet and are not read.
 *
 * @example
 * ```tsx
 * import { Breadcrumb } from "@scnx/system/components/breadcrumb";
 *
 * <Breadcrumb>
 *   <Breadcrumb.Item><Breadcrumb.Link href="/projects">Projects</Breadcrumb.Link></Breadcrumb.Item>
 *   <Breadcrumb.Item><Breadcrumb.Page>acme-dashboard</Breadcrumb.Page></Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 */
const BreadcrumbRoot = ({ className, children, "aria-label": label = "Breadcrumb", ...rest }: BreadcrumbProps) => (
  <nav {...rest} aria-label={label} className={cx("scnx-breadcrumb", className)}>
    <ol data-part="list">{children}</ol>
  </nav>
);

const BreadcrumbItem = (props: BreadcrumbItemProps) => <li data-part="item" {...props} />;

const BreadcrumbLink = (props: BreadcrumbLinkProps) => <LinkBase data-part="link" {...(props as LinkBaseProps)} />;

const BreadcrumbPage = (props: BreadcrumbPageProps) => <span data-part="page" {...props} aria-current="page" />;

BreadcrumbRoot.displayName = "Breadcrumb";
BreadcrumbItem.displayName = "Breadcrumb.Item";
BreadcrumbLink.displayName = "Breadcrumb.Link";
BreadcrumbPage.displayName = "Breadcrumb.Page";

export const Breadcrumb = Object.assign(BreadcrumbRoot, { Item: BreadcrumbItem, Link: BreadcrumbLink, Page: BreadcrumbPage });
