import type { Meta, StoryObj } from "@storybook/react-vite";
import { List } from "./List";

const meta = {
  title: "Atoms/List",
  component: List,
  argTypes: {
    variant: { control: "inline-radio", options: ["unordered", "ordered", "unstyled"] },
    spacing: { control: "inline-radio", options: ["compact", "default", "comfortable"] },
  },
  render: (args) => (
    <List {...args}>
      <List.Item>Approve the timesheet</List.Item>
      <List.Item>Run payroll</List.Item>
      <List.Item>Send payslips</List.Item>
    </List>
  ),
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unordered: Story = {};
export const Ordered: Story = { args: { variant: "ordered", type: "ordered", spacing: "default" } };
