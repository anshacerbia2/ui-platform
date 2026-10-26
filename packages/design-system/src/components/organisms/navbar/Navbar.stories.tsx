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
      <Navbar.Center>
        <Navbar.Link href="#overview">Overview</Navbar.Link>
        <Navbar.Link href="#docs" current>
          Docs
        </Navbar.Link>
        <Navbar.Link href="#changelog">Changelog</Navbar.Link>
      </Navbar.Center>
      <Navbar.End>
        <Button variant="secondary" size="small">
          Sign out
        </Button>
      </Navbar.End>
    </Navbar>
  ),
} satisfies Meta<typeof Navbar>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

/** The menu material, inset from the viewport: the marketing and documentation header. */
export const Floating: StoryObj<typeof meta> = { args: { variant: "floating" } };
