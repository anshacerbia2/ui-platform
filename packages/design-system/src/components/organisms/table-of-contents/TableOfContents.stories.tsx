import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
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
    defaultActiveId: "overview",
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "location");
    // The props of the active section stay off the nav element.
    await expect(canvas.getByRole("navigation")).not.toHaveAttribute("defaultactiveid");
  },
};

/**
 * The product owns the active section (`activeId`, `onActiveIdChange`), as a
 * page with its own scroll-spy or router does; the TOC shows what it is given.
 */
export const Controlled: Story = {
  args: { defaultActiveId: undefined },
  render: (args) => {
    const [activeId, setActiveId] = useState<string | null>("install");
    return (
      <div>
        <TableOfContents {...args} activeId={activeId} onActiveIdChange={setActiveId} />
        <button type="button" onClick={() => setActiveId("usage")}>Show usage</button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Install" })).toHaveAttribute("aria-current", "location");
    await userEvent.click(canvas.getByRole("button", { name: "Show usage" }));
    await expect(canvas.getByRole("link", { name: "Usage" })).toHaveAttribute("aria-current", "location");
    await expect(canvas.getByRole("link", { name: "Install" })).not.toHaveAttribute("aria-current");
  },
};
