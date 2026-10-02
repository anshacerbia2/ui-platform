import type { ReactElement } from "react";
import type { HeadingTag } from "../../types/polymorphic";
import type { HeadingBaseProps } from "./types";

/** HeadingBase - renders `h2`, or one tag of the closed {@link HeadingTag} union. */
export const HeadingBase = <T extends HeadingTag = "h2">({ as, ...rest }: HeadingBaseProps<T>): ReactElement => {
  const Tag = (as ?? "h2") as "h2";
  return <Tag {...(rest as HeadingBaseProps<"h2">)} />;
};

HeadingBase.displayName = "HeadingBase";
