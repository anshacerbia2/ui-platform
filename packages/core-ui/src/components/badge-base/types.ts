import type { ComponentPropsWithRef } from "react";

/** A non-interactive label, rendered as one `<span>` with its props. */
export type BadgeBaseProps = {
  /** Custom CSS classes. */
  className?: string;
} & ComponentPropsWithRef<"span">;
