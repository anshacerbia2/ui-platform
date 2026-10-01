import type { ReactElement } from "react";
import type { LayoutTag } from "../../types/polymorphic";
import type { ContainerBaseProps } from "./types";

/** ContainerBase - headless page container; one tag of the closed {@link LayoutTag} union. */
export const ContainerBase = <T extends LayoutTag = "div">({ as, ...rest }: ContainerBaseProps<T>): ReactElement => {
  const Tag = (as ?? "div") as "div";
  return <Tag {...(rest as ContainerBaseProps<"div">)} />;
};

ContainerBase.displayName = "ContainerBase";
