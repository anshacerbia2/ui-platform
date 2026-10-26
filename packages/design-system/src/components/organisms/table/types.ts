import type { ComponentPropsWithRef } from "react";

/** The table element; the frame around it is the flat material and scrolls a wide table. */
export type TableProps = ComponentPropsWithRef<"table">;

export type TableCaptionProps = ComponentPropsWithRef<"caption">;
export type TableHeadProps = ComponentPropsWithRef<"thead">;
export type TableBodyProps = ComponentPropsWithRef<"tbody">;

export type TableRowProps = ComponentPropsWithRef<"tr"> & {
  /** The row is selected; the control that selects it (a checkbox in the row) names the state. @default false */
  selected?: boolean;
};

/** Layout of a header or body cell. */
export type TableCellLayout = {
  /** `end` for numbers: end-aligned, tabular figures. @default "start" */
  align?: "start" | "end";
  /** The column takes only its content's width, for a checkbox or an action. @default false */
  shrink?: boolean;
};

// The obsolete HTML `align` attribute gives way to the layout prop.
export type TableHeaderCellProps = Omit<ComponentPropsWithRef<"th">, "align"> &
  TableCellLayout & {
    /** The column's sort order, as `aria-sort`; the consumer's sort button goes inside the cell. */
    sort?: "ascending" | "descending" | "none";
  };

export type TableCellProps = Omit<ComponentPropsWithRef<"td">, "align"> &
  TableCellLayout & {
    /** Secondary data in the subtle text. @default false */
    muted?: boolean;
  };
