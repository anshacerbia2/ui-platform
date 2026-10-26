import type { LinkBaseAnchorProps, LinkBaseChildProps } from "@scnx/core-ui/components/link-base";

/** Props every Link takes. */
export type LinkCommonProps = {
  /** `primary` is Scnx Blue text; `neutral` inherits the surrounding color, for dense copy such as footers and table cells. @default "primary" */
  variant?: "primary" | "neutral";
};

/** A native link; `external` adds the leaving-the-product icon after its text. */
export type LinkAnchorProps = LinkBaseAnchorProps &
  LinkCommonProps & {
    /** The link leaves the product. Set `target` only when the reader expects a new tab. @default false */
    external?: boolean;
  };

/** `asChild` styles its single child, for example a router Link. */
export type LinkChildProps = LinkBaseChildProps & LinkCommonProps & { external?: never };

export type LinkProps = LinkAnchorProps | LinkChildProps;
