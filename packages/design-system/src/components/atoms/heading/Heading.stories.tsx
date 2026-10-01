import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";

const SIZES = ["xxlarge", "xlarge", "large", "medium", "small", "xsmall"] as const;

const meta = {
  title: "Atoms/Heading",
  component: Heading,
  args: { children: "Quarterly revenue", size: "medium", weight: "bold" },
  argTypes: {
    size: { control: "select", options: SIZES },
    weight: { control: "inline-radio", options: ["bold", "semibold", "medium", "regular"] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The size is independent of the heading level (STD-UIP-TKN-001). */
export const Sizes: Story = {
  render: () => (
    <div>
      {SIZES.map((size) => (
        <Heading key={size} as="p" size={size}>
          typography.heading.{size}
        </Heading>
      ))}
    </div>
  ),
};
