import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flex } from "./Flex";

const meta = {
  title: "Layouts/Flex",
  component: Flex,
  args: { gap: "default" },
  argTypes: {
    direction: { control: "inline-radio", options: ["row", "col", "row-reverse", "col-reverse"] },
    gap: { control: "inline-radio", options: ["none", "compact", "default", "comfortable", "section"] },
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: { control: "select", options: ["start", "center", "end", "between", "around", "evenly"] },
  },
  render: (args) => (
    <Flex {...args}>
      {["One", "Two", "Three"].map((label) => (
      <div key={label} style={{ padding: "1rem", border: "1px dashed currentColor" }}>{label}</div>
    ))}
    </Flex>
  ),
} satisfies Meta<typeof Flex>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
