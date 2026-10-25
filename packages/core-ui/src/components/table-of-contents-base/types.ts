import type { ComponentPropsWithRef, ReactNode } from "react";

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
  /**
   * Height in px of a fixed header above the content. Defaults to the
   * document's computed `scroll-padding-top`, or 0 when that is `auto`.
   */
  navbarOffset?: number;
} & TableOfContentsActive & ComponentPropsWithRef<"nav">;

/**
 * The active section (TDD primitives P27). Uncontrolled by default: the root
 * tracks the heading in view and the link last followed, starting at
 * `defaultActiveId` or the first item. With `activeId` the product owns it:
 * the root renders that ID as current and reports what it would make active
 * through `onActiveIdChange`.
 */
export type TableOfContentsActive = {
  /** The active section's ID (controlled); `null` marks no link current. */
  activeId?: string | null;
  /** The initially active section's ID (uncontrolled). @default the first item's ID */
  defaultActiveId?: string;
  /** Called with the ID the root would make active: the heading scrolled into view or the link followed. */
  onActiveIdChange?: (id: string) => void;
};

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
 * Props for Base Link (TDD primitives P10): `targetId` names the heading the
 * link points to; the link's own `id`, if any, is a different ID.
 */
export type TableOfContentsBaseLinkProps = {
  /** ID of the target heading; the link's href is `#<targetId>`. */
  targetId: string;
  /** Render the single child element (for example a router Link) as the link. */
  asChild?: boolean;
} & Omit<ComponentPropsWithRef<"a">, "href">;

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
} & TableOfContentsActive;
