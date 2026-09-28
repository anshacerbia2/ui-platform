import type { 
  TableOfContentsBaseRootProps,
  TableOfContentsBaseItemProps as TableOfContentsItemProps,
  TableOfContentsBaseListProps as TableOfContentsListProps,
  TableOfContentsBaseLinkProps as TableOfContentsLinkProps,
  TableOfContentsItemState 
} from "@scnx/core-ui/components/table-of-contents-base";

/**
 * TableOfContentsProps - Extended with Registry Injection for Tier 1 Convenience.
 */
export type TableOfContentsProps = TableOfContentsBaseRootProps & {
  /** Optional: The custom link component to use globally (e.g. Next.js Link) */
  linkAs?: any;
  /** Optional: Props to pass to the LinkComponent */
  linkProps?: any;
};

export type { 
  TableOfContentsItemState, 
  TableOfContentsItemProps, 
  TableOfContentsListProps, 
  TableOfContentsLinkProps 
};
