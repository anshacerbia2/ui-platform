import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../atoms/button";
import { TextField } from "../../atoms/text-field";
import { Popover } from "./Popover";

const meta = {
  title: "Molecules/Popover",
  component: Popover,
  args: { defaultOpen: true },
  render: (args) => (
    <div style={{ padding: "1rem 1rem 16rem" }}>
      <Popover {...args}>
        <Popover.Trigger asChild>
          <Button variant="secondary">Share</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Share acme-dashboard</Popover.Title>
          <Popover.Body>People with the link can view deployments. Members can also redeploy.</Popover.Body>
          <TextField label="Link" defaultValue="https://scnx.dev/r/acme-dashboard" readOnly />
          <Popover.Actions>
            <Popover.Close asChild>
              <Button variant="secondary" size="small">
                Done
              </Button>
            </Popover.Close>
            <Button size="small">Copy link</Button>
          </Popover.Actions>
        </Popover.Content>
      </Popover>
    </div>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
export const Open: StoryObj<typeof meta> = {};
