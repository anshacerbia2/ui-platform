import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";

const VARIANTS = ["body-large", "body-default", "body-small", "label-default", "label-small"] as const;

const meta = {
  title: "Atoms/Text",
  component: Text,
  args: { children: "Payroll runs on the last business day of each month.", variant: "body-default" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    weight: { control: "inline-radio", options: [undefined, "bold", "semibold", "medium", "regular"] },
    align: { control: "inline-radio", options: ["left", "center", "right"] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div>
      {VARIANTS.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant}: The quick brown fox jumps over the lazy dog.
        </Text>
      ))}
    </div>
  ),
};

export const Dimmed: Story = { args: { dimmed: true } };
