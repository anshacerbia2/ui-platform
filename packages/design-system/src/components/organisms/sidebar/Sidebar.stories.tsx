import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

const meta = {
  title: "Organisms/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <SidebarProvider activePath="#people">
      <div style={{ height: "32rem", display: "flex" }}>
        <Sidebar {...args}>
          <Sidebar.Header>Scnehaux</Sidebar.Header>
          <Sidebar.Nav aria-label="Main">
            <Sidebar.Nav.Group>
              <Sidebar.Nav.GroupHeader>Workspace</Sidebar.Nav.GroupHeader>
              <Sidebar.Nav.Item href="#dashboard" label="Dashboard" />
              <Sidebar.Nav.Item href="#people" label="People" />
              <Sidebar.Nav.Item label="Payroll" id="payroll">
                <Sidebar.Nav.Group>
                  <Sidebar.Nav.Item href="#runs" label="Runs" />
                  <Sidebar.Nav.Item href="#payslips" label="Payslips" />
                </Sidebar.Nav.Group>
              </Sidebar.Nav.Item>
            </Sidebar.Nav.Group>
          </Sidebar.Nav>
          <Sidebar.Footer>v0 workshop</Sidebar.Footer>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
export const Expanded: StoryObj<typeof meta> = {};
