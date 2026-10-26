import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button";
import { Kbd } from "../../atoms/kbd";
import { Menu } from "./Menu";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const meta = {
  title: "Molecules/Menu",
  component: Menu,
  args: { defaultOpen: true },
  render: (args) => (
    <div style={{ padding: "1rem 1rem 18rem" }}>
      <Menu {...args}>
        <Menu.Trigger asChild>
          <Button variant="secondary">Actions</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Group>
            <Menu.Label>Project</Menu.Label>
            <Menu.Item icon={icon("M4 20h4l10-10-4-4L4 16v4z")} shortcut={<Kbd>R</Kbd>} aria-keyshortcuts="R">
              Rename
            </Menu.Item>
            <Menu.Item icon={icon("M8 8h12v12H8zM4 16V4h12")} shortcut={<Kbd>D</Kbd>} aria-keyshortcuts="D">
              Duplicate
            </Menu.Item>
            <Menu.Item icon={icon("M4 7h16M6 7v13h12V7M9 4h6")} disabled>
              Archive
            </Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item variant="danger" icon={icon("M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3")}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  ),
} satisfies Meta<typeof Menu>;

export default meta;
export const Open: StoryObj<typeof meta> = {};
