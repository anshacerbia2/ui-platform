import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack";

const meta = {
  title: "Layouts/Stack",
  component: Stack,
  args: { gap: "default" },
  argTypes: { gap: { control: "inline-radio", options: ["none", "compact", "default", "comfortable", "section"] } },
  render: (args) => (
    <Stack {...args}>
      {["One", "Two", "Three"].map((label) => (
      <div key={label} style={{ padding: "1rem", border: "1px dashed currentColor" }}>{label}</div>
    ))}
    </Stack>
  ),
} satisfies Meta<typeof Stack>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
