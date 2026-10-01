import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

const meta = {
  title: "Layouts/Box",
  component: Box,
  args: { children: "A Box renders a plain div, or its child with asChild." },
} satisfies Meta<typeof Box>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
