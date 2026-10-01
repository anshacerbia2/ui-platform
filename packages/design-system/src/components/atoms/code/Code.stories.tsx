import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code } from "./Code";

const meta = {
  title: "Atoms/Code",
  component: Code,
  args: { children: "pnpm build" },
  argTypes: { intent: { control: "select", options: [undefined, "primary", "info", "success", "warning", "danger"] } },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Intents: Story = {
  render: () => (
    <p>
      {(["primary", "info", "success", "warning", "danger"] as const).map((intent) => (
        <span key={intent}>
          <Code intent={intent}>{intent}</Code>{" "}
        </span>
      ))}
    </p>
  ),
};
