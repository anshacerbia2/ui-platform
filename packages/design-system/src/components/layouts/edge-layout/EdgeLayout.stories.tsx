import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, SidebarProvider } from "../../organisms/sidebar";
import { EdgeLayout } from "./EdgeLayout";

const meta = {
  title: "Layouts/EdgeLayout",
  component: EdgeLayout,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <SidebarProvider activePath="#people">
      <EdgeLayout {...args}>
        {/* EdgeLayout.Navbar renders the Navbar banner itself. */}
        <EdgeLayout.Navbar>
          <EdgeLayout.Navbar.Start>
            <strong>Scnehaux</strong>
          </EdgeLayout.Navbar.Start>
        </EdgeLayout.Navbar>
        <EdgeLayout.Sidebar>
          <Sidebar>
            <Sidebar.Nav aria-label="Main">
              <Sidebar.Nav.Group>
                <Sidebar.Nav.Item href="#dashboard" label="Dashboard" />
                <Sidebar.Nav.Item href="#people" label="People" />
              </Sidebar.Nav.Group>
            </Sidebar.Nav>
          </Sidebar>
        </EdgeLayout.Sidebar>
        <EdgeLayout.Content>
          <p>Page content scrolls under the sticky navigation bar.</p>
        </EdgeLayout.Content>
      </EdgeLayout>
    </SidebarProvider>
  ),
} satisfies Meta<typeof EdgeLayout>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
