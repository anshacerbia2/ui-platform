import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../avatar";
import { AvatarGroup } from "./AvatarGroup";

const meta = {
  title: "Atoms/AvatarGroup",
  component: AvatarGroup,
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar name="Ana Nugraha" />
      <Avatar name="Budi Santoso" />
      <Avatar name="Citra Wulandari" />
    </AvatarGroup>
  ),
  args: { "aria-label": "Reviewers" },
} satisfies Meta<typeof AvatarGroup>;

export default meta;

/** Overlapping by 6px, each ringed in the canvas. */
export const Default: StoryObj<typeof meta> = {};
