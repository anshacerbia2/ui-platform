import type { ComponentPropsWithRef, ReactElement } from "react";
import type { ListBaseItemProps, ListBaseRootProps } from "./types";

/** ListBaseRoot - a native `ul`, or `ol` when `type="ordered"`. */
export const ListBaseRoot = ({ type = "unordered", ...rest }: ListBaseRootProps): ReactElement =>
  type === "ordered" ? (
    <ol data-slot="list" {...(rest as ComponentPropsWithRef<"ol">)} />
  ) : (
    <ul data-slot="list" {...rest} />
  );

/** ListBaseItem - a native `li`. */
export const ListBaseItem = (props: ListBaseItemProps): ReactElement => <li data-slot="list-item" {...props} />;
