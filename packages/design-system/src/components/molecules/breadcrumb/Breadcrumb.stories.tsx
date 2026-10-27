import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  render: (args) => (
    <Breadcrumb {...args}>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#projects">Projects</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="#acme">Acme</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Page>acme-dashboard</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb>
  ),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
