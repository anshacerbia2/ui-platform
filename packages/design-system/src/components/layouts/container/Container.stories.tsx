import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container } from "./Container";

const meta = {
  title: "Layouts/Container",
  component: Container,
  args: { size: "prose" },
  argTypes: { size: { control: "inline-radio", options: ["prose", "base", "wide", "fluid"] } },
  render: (args) => (
    <Container {...args}>
      <p style={{ border: "1px dashed currentColor", padding: "1rem" }}>
        Content is centered and capped at the {String(args.size)} width, with the page gutter on both sides.
      </p>
    </Container>
  ),
} satisfies Meta<typeof Container>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
