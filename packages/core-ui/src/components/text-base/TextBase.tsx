import type { ReactElement } from "react";
import type { TextTag } from "../../types/polymorphic";
import type { TextBaseProps } from "./types";

/** TextBase - renders `p`, or one tag of the closed {@link TextTag} union. */
export const TextBase = <T extends TextTag = "p">({ as, ...rest }: TextBaseProps<T>): ReactElement => {
  const Tag = (as ?? "p") as "p";
  return <Tag data-slot="text" {...(rest as TextBaseProps<"p">)} />;
};

TextBase.displayName = "TextBase";
