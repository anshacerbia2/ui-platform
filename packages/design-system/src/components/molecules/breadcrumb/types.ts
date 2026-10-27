import type { LinkBaseProps } from "@scnx/core-ui/components/link-base";
import type { ComponentPropsWithRef } from "react";

/** The labelled navigation landmark holding the trail. */
export type BreadcrumbProps = ComponentPropsWithRef<"nav">;

/** One level of the trail. */
export type BreadcrumbItemProps = ComponentPropsWithRef<"li">;

/** An ancestor: a native link, or with `asChild` a router Link. */
export type BreadcrumbLinkProps = LinkBaseProps;

/** The current page: not a link. */
export type BreadcrumbPageProps = Omit<ComponentPropsWithRef<"span">, "aria-current">;
