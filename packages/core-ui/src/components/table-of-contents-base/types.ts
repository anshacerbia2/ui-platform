import type { ComponentPropsWithRef, ReactNode } from "react";
import type { As, PolymorphicProps } from "../../types/polymorphic";

/**
 * TableOfContentsItemState - Represents a single heading in the TOC.
 */
export type TableOfContentsItemState = {
  id: string;
  title: string;
  url?: string;
  depth?: number;
  subcontent?: TableOfContentsItemState[];
};

/**
 * TableOfContentsBaseRootProps - Root props for the TOC logic.
 * Uses React 19 ref-as-prop.
 */
export type TableOfContentsBaseRootProps = {
  children?: ReactNode;
  /** Global Table of Contents items - used for state initialization */
  items?: TableOfContentsItemState[];
  /** Margin applied above the active section interceptor (gap). */
  scrollOffsetExtended?: number;
  /** Custom offset for navbar height or other top fixed elements */
  navbarOffset?: number;
  /** Initial active section ID */
  initialActiveId?: string;
} & ComponentPropsWithRef<"nav">;

/** 
 * Props for Base List.
 * Fixed to semantic 'ul' for structural consistency.
 */
export type TableOfContentsBaseListProps = ComponentPropsWithRef<"ul">;

/** 
 * Props for Base Item.
 * Fixed to semantic 'li' for structural consistency.
 */
export type TableOfContentsBaseItemProps = ComponentPropsWithRef<"li">;

/** 
 * Props for Base Link.
 * Uses the global PolymorphicProps utility for architectural consistency.
 */
export type TableOfContentsBaseLinkProps<E extends As = "a"> = PolymorphicProps<E>;

/**
 * TableOfContentsContextValue - Shared state for TOC sub-components.
 */
export type TableOfContentsContextValue = {
  activeId: string | null;
  items: TableOfContentsItemState[];
  registerItem: (item: TableOfContentsItemState) => void;
  unregisterItem: (id: string) => void;
  scrollTo: (id: string) => void;
};

/**
 * UseTableOfContentsTrackerProps - Props for the internal logic hook.
 */
export type UseTableOfContentsTrackerProps = {
  items: TableOfContentsItemState[];
  scrollOffsetExtended?: number;
  navbarOffset?: number;
  initialActiveId?: string;
};
