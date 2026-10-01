import type { Meta, StoryObj } from "@storybook/react-vite";
import { Navigation } from "./Navigation";

const meta = {
  title: "Organisms/Navigation",
  component: Navigation,
  render: (args) => (
    <Navigation {...args} aria-label="Main">
      <Navigation.Group>
        <Navigation.GroupHeader>Workspace</Navigation.GroupHeader>
        <Navigation.Item href="#dashboard" label="Dashboard" isActive />
        <Navigation.Item href="#people" label="People" badge="12" />
        <Navigation.Item href="#payroll" label="Payroll" />
      </Navigation.Group>
      <Navigation.Group>
        <Navigation.GroupHeader>Settings</Navigation.GroupHeader>
        <Navigation.Item href="#organization" label="Organization" />
      </Navigation.Group>
    </Navigation>
  ),
} satisfies Meta<typeof Navigation>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
