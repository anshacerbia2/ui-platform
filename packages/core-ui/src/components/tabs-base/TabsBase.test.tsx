import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TabsBase } from "./TabsBase";
import type { TabsBaseProps } from "./types";

const Employee = (props: Partial<TabsBaseProps> & { disabledLeave?: boolean }) => {
  const { disabledLeave, ...rest } = props;
  return (
    <TabsBase id="emp" {...({ defaultValue: "pay", ...rest } as TabsBaseProps)}>
      <TabsBase.List aria-label="Employee">
        <TabsBase.Tab value="pay">Pay</TabsBase.Tab>
        <TabsBase.Tab value="leave" disabled={disabledLeave}>
          Leave
        </TabsBase.Tab>
        <TabsBase.Tab value="tax id">Tax</TabsBase.Tab>
      </TabsBase.List>
      <TabsBase.Panel value="pay">Pay panel</TabsBase.Panel>
      <TabsBase.Panel value="leave">Leave panel</TabsBase.Panel>
      <TabsBase.Panel value="tax id">Tax panel</TabsBase.Panel>
    </TabsBase>
  );
};

const tab = (name: string) => screen.getByRole("tab", { name });

describe("TabsBase (TDD primitives P17)", () => {
  it("wires tablist, tabs, and panels and selects the default", () => {
    render(<Employee />);
    expect(screen.getByRole("tablist", { name: "Employee" })).not.toHaveAttribute("aria-orientation");
    expect(tab("Pay")).toHaveAttribute("aria-selected", "true");
    expect(tab("Leave")).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel", { name: "Pay" });
    expect(panel).toHaveAttribute("tabindex", "0");
    expect(tab("Pay")).toHaveAttribute("aria-controls", panel.id);
    expect(screen.getByText("Leave panel", { selector: "[role=tabpanel]" })).not.toBeVisible();
    expect(tab("Tax").id).toBe("emp-tab-tax_20id");
  });

  it("keeps only the selected tab in the Tab sequence", async () => {
    render(<Employee />);
    expect(tab("Pay")).toHaveAttribute("tabindex", "0");
    expect(tab("Leave")).toHaveAttribute("tabindex", "-1");
    await userEvent.tab();
    expect(tab("Pay")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("tabpanel", { name: "Pay" })).toHaveFocus();
  });

  it("moves with Left and Right, wraps, and activates automatically", async () => {
    const onValueChange = vi.fn();
    render(<Employee onValueChange={onValueChange} />);
    tab("Pay").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Leave")).toHaveFocus();
    expect(tab("Leave")).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("leave");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(tab("Pay")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(tab("Tax")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(tab("Pay")).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(tab("Tax")).toHaveAttribute("aria-selected", "true");
  });

  it("ignores Up and Down when horizontal, uses them when vertical", async () => {
    const { unmount } = render(<Employee />);
    tab("Pay").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(tab("Pay")).toHaveFocus();
    unmount();
    render(<Employee orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    tab("Pay").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(tab("Leave")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Leave")).toHaveFocus();
  });

  it("with manual activation, moves focus without selecting until Enter or Space", async () => {
    render(<Employee activation="manual" />);
    tab("Pay").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Leave")).toHaveFocus();
    expect(tab("Leave")).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{Enter}");
    expect(tab("Leave")).toHaveAttribute("aria-selected", "true");
  });

  it("skips a disabled tab", async () => {
    render(<Employee disabledLeave />);
    tab("Pay").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Tax")).toHaveFocus();
    await userEvent.click(tab("Leave"));
    expect(tab("Leave")).toHaveAttribute("aria-selected", "false");
  });

  it("is controlled by value and onValueChange", async () => {
    const Controlled = () => {
      const [value, setValue] = useState("pay");
      return <Employee value={value} onValueChange={setValue} defaultValue={undefined} />;
    };
    render(<Controlled />);
    await userEvent.click(tab("Tax"));
    expect(tab("Tax")).toHaveAttribute("aria-selected", "true");
  });

  it("requires its parts to be inside TabsBase", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsBase.Tab value="x">X</TabsBase.Tab>)).toThrow("TabsBase.Tab must be rendered inside TabsBase");
    error.mockRestore();
  });
});
