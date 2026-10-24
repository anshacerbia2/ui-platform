import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";
import type { BadgeScheme } from "./types";

const SCHEMES: BadgeScheme[] = ["neutral", "primary", "info", "success", "warning", "danger"];

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Beta" },
  argTypes: {
    scheme: { control: "select", options: SCHEMES },
    emphasis: { control: "inline-radio", options: ["subtle", "solid"] },
    size: { control: "inline-radio", options: ["small", "medium"] },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every scheme in both emphases; the text names the state, the scheme only reinforces it. */
export const Schemes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 8 }}>
      {(["subtle", "solid"] as const).map((emphasis) => (
        <div key={emphasis} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SCHEMES.map((scheme) => (
            <Badge {...args} key={scheme} scheme={scheme} emphasis={emphasis}>
              {scheme}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Small: Story = { args: { size: "small", scheme: "success", children: "Live" } };

/** A live status leads with a 6 px dot in the text color; the word still names the status. */
export const Status: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge {...args} scheme="success" dot>
        Live
      </Badge>
      <Badge {...args} scheme="warning" dot>
        Building
      </Badge>
      <Badge {...args} scheme="danger" dot>
        Failed
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const live = within(canvasElement).getByText("Live");
    const dot = live.querySelector("[data-part=dot]");
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    const box = dot!.getBoundingClientRect();
    await expect([box.width, box.height]).toEqual([6, 6]);
  },
};
