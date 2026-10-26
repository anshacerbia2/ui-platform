import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table } from "./Table";

const People = () => (
  <Table aria-label="People" className="extra">
    <Table.Caption>Payroll, October</Table.Caption>
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell shrink>#</Table.HeaderCell>
        <Table.HeaderCell sort="ascending">Name</Table.HeaderCell>
        <Table.HeaderCell align="end">Salary</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      <Table.Row>
        <Table.HeaderCell scope="row" shrink>
          1
        </Table.HeaderCell>
        <Table.Cell>Ana</Table.Cell>
        <Table.Cell align="end">12,500</Table.Cell>
      </Table.Row>
      <Table.Row selected>
        <Table.HeaderCell scope="row" shrink>
          2
        </Table.HeaderCell>
        <Table.Cell muted>Budi</Table.Cell>
        <Table.Cell align="end">9,800</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);

describe("Table (TDD styled TA1-TA3)", () => {
  it("is a native table in the frame, named and captioned", () => {
    render(<People />);
    const table = screen.getByRole("table", { name: "People" });
    expect(table).toHaveClass("scnx-table__table", "extra");
    expect(table.parentElement).toHaveClass("scnx-table");
    expect(table.querySelector("caption")).toHaveTextContent("Payroll, October");
  });

  it("makes header cells column headers unless scoped otherwise, and carries the sort order", () => {
    render(<People />);
    const name = screen.getByRole("columnheader", { name: "Name" });
    expect(name).toHaveAttribute("scope", "col");
    expect(name).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Salary" })).not.toHaveAttribute("aria-sort");
    expect(screen.getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual(["1", "2"]);
  });

  it("marks alignment, shrink, muted, and the selected row as data attributes", () => {
    render(<People />);
    const [, first, second] = screen.getAllByRole("row");
    expect(second).toHaveAttribute("data-state", "selected");
    expect(first).not.toHaveAttribute("data-state");
    expect(within(second).getByText("9,800")).toHaveAttribute("data-align", "end");
    expect(within(second).getByText("Budi")).toHaveAttribute("data-muted");
    expect(within(first).getByText("Ana")).not.toHaveAttribute("data-muted");
    expect(screen.getByRole("columnheader", { name: "#" })).toHaveAttribute("data-shrink");
  });
});
