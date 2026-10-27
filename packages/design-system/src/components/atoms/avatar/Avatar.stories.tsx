import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarGroup } from "./Avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Ana Nugraha" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

/** 24, 32, and 40px; circles for people, squares for workspaces. */
export const SizesAndShapes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Avatar name="Ana Nugraha" size="small" />
        <Avatar name="Ana Nugraha" />
        <Avatar name="Ana Nugraha" size="large" status="online" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Avatar name="Acme" shape="square" size="small" />
        <Avatar name="Acme" shape="square" />
        <Avatar name="Acme" shape="square" size="large" />
      </div>
    </div>
  ),
};

/** Overlapping by 6px, each ringed in the canvas. */
export const Group: Story = {
  render: () => (
    <AvatarGroup aria-label="Reviewers">
      <Avatar name="Ana Nugraha" />
      <Avatar name="Budi Santoso" />
      <Avatar name="Citra Wulandari" />
    </AvatarGroup>
  ),
};
