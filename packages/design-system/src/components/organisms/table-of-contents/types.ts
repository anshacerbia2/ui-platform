import type { 
  TableOfContentsBaseRootProps,
  TableOfContentsBaseItemProps as TableOfContentsItemProps,
  TableOfContentsBaseListProps as TableOfContentsListProps,
  TableOfContentsBaseLinkProps as TableOfContentsLinkProps,
  TableOfContentsItemState 
} from "@scnx/core-ui/components/table-of-contents-base";

/** The styled table of contents: base root props plus its visible label. */
export type TableOfContentsProps = TableOfContentsBaseRootProps & {
  /** Visible label and accessible name of the navigation. @default "Contents" */
  label?: string;
};

export type { 
  TableOfContentsItemState, 
  TableOfContentsItemProps, 
  TableOfContentsListProps, 
  TableOfContentsLinkProps 
};
