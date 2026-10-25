import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Kbd } from "./Kbd";

const meta = {
  title: "Atoms/Kbd",
  component: Kbd,
  args: { children: "K" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One key: a 20px keycap; a single glyph is square. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const key = within(canvasElement).getByText("K");
    const { width, height } = key.getBoundingClientRect();
    await expect([width, height]).toEqual([20, 20]);
  },
};

/** A chord is several keys side by side; macOS glyphs, words elsewhere. */
export const Chord: Story = {
  render: () => (
    <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", margin: 0 }}>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
      <span style={{ marginInline: "0.5rem" }}>or</span>
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>P</Kbd>
    </p>
  ),
};
