import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button";
import { Navbar } from "./Navbar";

const meta = {
  title: "Organisms/Navbar",
  component: Navbar,
  render: (args) => (
    <Navbar {...args}>
      <Navbar.Start>
        <strong>Scnehaux</strong>
      </Navbar.Start>
      <Navbar.Center>Workspace</Navbar.Center>
      <Navbar.End>
        <Button variant="secondary">Sign out</Button>
      </Navbar.End>
    </Navbar>
  ),
} satisfies Meta<typeof Navbar>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
