import type { Meta, StoryObj } from "@storybook/react-vite";
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
