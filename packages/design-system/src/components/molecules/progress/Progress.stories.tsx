import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";

const meta = {
  title: "Molecules/Progress",
  component: Progress,
  args: { label: "Storage", value: 7.2, max: 10, valueText: "7.2 of 10 GB" },
  render: (args) => (
    <div style={{ inlineSize: "20rem" }}>
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/** Complete. */
export const Success: Story = { args: { label: "Backup", value: 100, valueText: "Complete", scheme: "success", max: 100 } };

/** Over a limit. */
export const Danger: Story = { args: { label: "Seats", value: 54, max: 50, valueText: "54 of 50", scheme: "danger" } };
