import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tabs } from "./Tabs";
import type { TabsProps } from "./types";

const Employee = (props: Partial<TabsProps>) => (
  <Tabs {...({ defaultValue: "pay", ...props } as TabsProps)}>
    <Tabs.List aria-label="Employee record">
      <Tabs.Tab value="pay">Pay</Tabs.Tab>
      <Tabs.Tab value="leave">Leave</Tabs.Tab>
      <Tabs.Tab value="documents" disabled>
        Documents
      </Tabs.Tab>
      <Tabs.Tab value="tax">Tax</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="pay">Monthly salary, paid on the 25th.</Tabs.Panel>
    <Tabs.Panel value="leave">14 days of annual leave remaining.</Tabs.Panel>
    <Tabs.Panel value="documents">No documents.</Tabs.Panel>
    <Tabs.Panel value="tax">Tax ID on file.</Tabs.Panel>
  </Tabs>
);

const meta = {
  title: "Organisms/Tabs",
  component: Tabs,
  args: { defaultValue: "pay" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys move and select (automatic activation), skip the disabled tab, and wrap. */
export const Automatic: Story = {
  render: () => <Employee />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Pay" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Leave" })).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Tax" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Pay" })).toHaveFocus();
  },
};

/** Manual activation: arrows move focus; Enter selects. */
export const Manual: Story = {
  render: () => <Employee activation="manual" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveAttribute("aria-selected", "false");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveAttribute("aria-selected", "true");
  },
};

/** Right-to-left: Left moves to the next tab (React Aria's behavior); the vertical list mirrors. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Employee />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveFocus();
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveAttribute("aria-selected", "true");
  },
};

/** Vertical: Up and Down move; the list carries aria-orientation. */
export const Vertical: Story = {
  render: () => <Employee orientation="vertical" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("tab", { name: "Leave" })).toHaveFocus();
  },
};
