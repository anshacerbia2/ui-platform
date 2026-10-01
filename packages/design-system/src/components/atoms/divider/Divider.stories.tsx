import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    weight: { control: "inline-radio", options: ["thin", "normal", "thick"] },
    color: { control: "inline-radio", options: ["default", "muted", "primary"] },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div>
      <p>Above</p>
      <Divider {...args} />
      <p>Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ display: "flex", height: "3rem", alignItems: "stretch" }}>
      <span>Left</span>
      <Divider {...args} />
      <span>Right</span>
    </div>
  ),
};
