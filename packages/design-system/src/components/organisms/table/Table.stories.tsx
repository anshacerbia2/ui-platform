import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../../atoms/badge";
import { Table } from "./Table";

const PEOPLE = [
  { id: 1, name: "Ana Nugraha", team: "Payroll", salary: "12,500,000", status: "Active" },
  { id: 2, name: "Budi Santoso", team: "Finance", salary: "9,800,000", status: "Active" },
  { id: 3, name: "Citra Wulandari", team: "People", salary: "11,200,000", status: "On leave" },
];

const meta = {
  title: "Organisms/Table",
  component: Table,
  render: (args) => (
    <Table {...args}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sort="ascending">Name</Table.HeaderCell>
          <Table.HeaderCell>Team</Table.HeaderCell>
          <Table.HeaderCell align="end">Salary (IDR)</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PEOPLE.map((person) => (
          <Table.Row key={person.id} selected={person.id === 2}>
            <Table.HeaderCell scope="row">{person.name}</Table.HeaderCell>
            <Table.Cell muted>{person.team}</Table.Cell>
            <Table.Cell align="end">{person.salary}</Table.Cell>
            <Table.Cell>
              <Badge scheme={person.status === "Active" ? "success" : "warning"}>{person.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
  args: { "aria-label": "People" },
} satisfies Meta<typeof Table>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
