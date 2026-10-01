import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, SidebarProvider } from "../../organisms/sidebar";
import { FloatingLayout } from "./FloatingLayout";

const meta = {
  title: "Layouts/FloatingLayout",
  component: FloatingLayout,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <SidebarProvider activePath="#people">
      <FloatingLayout {...args}>
        <FloatingLayout.Sidebar>
          <Sidebar>
            <Sidebar.Nav aria-label="Main">
              <Sidebar.Nav.Group>
                <Sidebar.Nav.Item href="#dashboard" label="Dashboard" />
                <Sidebar.Nav.Item href="#people" label="People" />
              </Sidebar.Nav.Group>
            </Sidebar.Nav>
          </Sidebar>
        </FloatingLayout.Sidebar>
        <FloatingLayout.Content>
          <p>The sidebar floats beside the content.</p>
        </FloatingLayout.Content>
      </FloatingLayout>
    </SidebarProvider>
  ),
} satisfies Meta<typeof FloatingLayout>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
