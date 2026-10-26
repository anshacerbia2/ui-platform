import { cx } from "styled-system/css";
import type { TableBodyProps, TableCaptionProps, TableCellProps, TableHeadProps, TableHeaderCellProps, TableProps, TableRowProps } from "./types";

/**
 * Table - records in rows for comparison, on native table semantics (WHATWG
 * HTML tables): a `table` in a frame that is the flat material and scrolls a
 * wide table. It holds no state; selection and sorting belong to the consumer,
 * who puts a checkbox or a sort button inside a cell. Header cells are column
 * headers unless given another `scope`.
 *
 * @example
 * ```tsx
 * import { Table } from "@scnx/system/components/table";
 *
 * <Table aria-label="People">
 *   <Table.Head>
 *     <Table.Row>
 *       <Table.HeaderCell sort="ascending">Name</Table.HeaderCell>
 *       <Table.HeaderCell align="end">Salary</Table.HeaderCell>
 *     </Table.Row>
 *   </Table.Head>
 *   <Table.Body>
 *     <Table.Row selected>
 *       <Table.Cell>Ana</Table.Cell>
 *       <Table.Cell align="end">12.500.000</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * ```
 */
const TableRoot = ({ className, ...rest }: TableProps) => (
  <div className="scnx-table">
    <table {...rest} className={cx("scnx-table__table", className)} />
  </div>
);

const TableCaption = ({ className, ...rest }: TableCaptionProps) => <caption {...rest} className={cx("scnx-table__caption", className)} />;

const TableHead = (props: TableHeadProps) => <thead {...props} />;

const TableBody = (props: TableBodyProps) => <tbody {...props} />;

const TableRow = ({ selected = false, ...rest }: TableRowProps) => <tr data-state={selected ? "selected" : undefined} {...rest} />;

const TableHeaderCell = ({ align = "start", shrink = false, sort, scope = "col", ...rest }: TableHeaderCellProps) => (
  <th scope={scope} aria-sort={sort} data-align={align} data-shrink={shrink || undefined} {...rest} />
);

const TableCell = ({ align = "start", shrink = false, muted = false, ...rest }: TableCellProps) => (
  <td data-align={align} data-shrink={shrink || undefined} data-muted={muted || undefined} {...rest} />
);

TableRoot.displayName = "Table";
TableCaption.displayName = "Table.Caption";
TableHead.displayName = "Table.Head";
TableBody.displayName = "Table.Body";
TableRow.displayName = "Table.Row";
TableHeaderCell.displayName = "Table.HeaderCell";
TableCell.displayName = "Table.Cell";

export const Table = Object.assign(TableRoot, {
  Caption: TableCaption,
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
});
