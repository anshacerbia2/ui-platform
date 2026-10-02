import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";

// TDD primitives P11: the toggle controls its sidebar and has a required
// name; the collapsed flyout is non-modal and Escape returns focus to its opener.
const Fixture = ({ defaultIsOpen }: { defaultIsOpen: boolean }) => (
  <div data-scnx-theme="default" data-scnx-resolved-mode="light">
    <SidebarProvider defaultIsOpen={defaultIsOpen}>
      <Sidebar>
        <Sidebar.Toggle label="Collapse sidebar" />
        <Sidebar.Nav aria-label="Main">
          <Sidebar.Nav.Group>
            <Sidebar.Nav.Item label="Payroll" id="payroll">
              <Sidebar.Nav.Group>
                <Sidebar.Nav.Item href="#runs" label="Runs" />
              </Sidebar.Nav.Group>
            </Sidebar.Nav.Item>
          </Sidebar.Nav.Group>
        </Sidebar.Nav>
      </Sidebar>
    </SidebarProvider>
  </div>
);

describe("Sidebar", () => {
  it("toggle: named by its label, controls the sidebar, reflects its state", async () => {
    render(<Fixture defaultIsOpen />);
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    const sidebar = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(sidebar?.tagName).toBe("ASIDE");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  it("collapsed flyout: Escape closes it and returns focus to its opener", async () => {
    render(<Fixture defaultIsOpen={false} />);
    const opener = screen.getByRole("button", { name: "Payroll" });
    fireEvent.click(opener);
    const flyout = await screen.findByText("Runs");
    expect(flyout.closest(".scnx-sidebar__flyout")).not.toBeNull();
    screen.getAllByRole("link", { name: "Runs" }).at(-1)!.focus();
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    });
    expect(opener).toHaveFocus();
  });
});
