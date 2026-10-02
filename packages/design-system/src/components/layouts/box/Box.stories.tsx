import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

const meta = {
  title: "Layouts/Box",
  component: Box,
  args: { children: "A Box renders a div, or one layout tag through as." },
} satisfies Meta<typeof Box>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
