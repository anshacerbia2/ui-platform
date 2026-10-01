import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableOfContents } from "./TableOfContents";

const meta = {
  title: "Organisms/TableOfContents",
  component: TableOfContents,
  args: {
    items: [
      { id: "overview", title: "Overview", url: "#overview" },
      { id: "install", title: "Install", url: "#install", subcontent: [{ id: "requirements", title: "Requirements", url: "#requirements" }] },
      { id: "usage", title: "Usage", url: "#usage" },
    ],
    initialActiveId: "overview",
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
