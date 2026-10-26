import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button";
import { Kbd } from "../../atoms/kbd";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Molecules/Tooltip",
  component: Tooltip,
  args: { content: "Copy link", open: true, children: <Button variant="secondary">Share</Button> },
  render: (args) => (
    <div style={{ padding: "4rem", display: "flex", justifyContent: "center" }}>
      <Tooltip {...args} />
    </div>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

/** A shortcut in the tooltip: the keycap takes the ink. */
export const WithShortcut: Story = {
  args: {
    content: (
      <>
        Search <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </>
    ),
  },
};

/** Closed until a pointer rests on the trigger for 400ms or the keyboard focuses it. */
export const OnHover: Story = { args: { open: undefined } };
