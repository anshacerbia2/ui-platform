import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid } from "./Grid";

const meta = {
  title: "Layouts/Grid",
  component: Grid,
  args: { columns: "3", gap: "comfortable" },
  argTypes: {
    columns: { control: "select", options: ["1", "2", "3", "4", "6", "12"] },
    gap: { control: "inline-radio", options: ["none", "compact", "default", "comfortable", "section"] },
  },
  render: (args) => (
    <Grid {...args}>
      {["One", "Two", "Three"].map((label) => (
      <div key={label} style={{ padding: "1rem", border: "1px dashed currentColor" }}>{label}</div>
    ))}
    </Grid>
  ),
} satisfies Meta<typeof Grid>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
