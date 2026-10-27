import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  args: { label: "Loading deployments" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};

/** 16, 20, and 36px. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Spinner label="Loading" size="small" />
      <Spinner label="Loading" size="medium" />
      <Spinner label="Loading" size="large" />
    </div>
  ),
};
