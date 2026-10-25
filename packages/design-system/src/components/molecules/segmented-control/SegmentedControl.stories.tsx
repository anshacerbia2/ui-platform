import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { SegmentedControl } from "./SegmentedControl";

const Sun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Monitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);
const Moon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

const meta = {
  title: "Molecules/SegmentedControl",
  component: SegmentedControl,
  args: { "aria-label": "Range", defaultValue: "7d" },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Text segments: a 36px well of 28px segments; the checked one is the raised thumb. Arrow keys move and check, skipping a disabled segment. */
export const Default: Story = {
  render: () => (
    <SegmentedControl aria-label="Range" defaultValue="7d">
      <SegmentedControl.Item value="24h">24h</SegmentedControl.Item>
      <SegmentedControl.Item value="7d">7 days</SegmentedControl.Item>
      <SegmentedControl.Item value="30d">30 days</SegmentedControl.Item>
      <SegmentedControl.Item value="90d" disabled>
        90 days
      </SegmentedControl.Item>
    </SegmentedControl>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup").getBoundingClientRect().height).toBe(36);
    await expect(canvas.getByText("7 days").closest("label")!.getBoundingClientRect().height).toBe(28);
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "7 days" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "30 days" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "24h" })).toBeChecked();
  },
};

/** Icon segments, each named by its aria-label: the docs site's theme switch. */
export const Icons: Story = {
  render: () => {
    const [mode, setMode] = useState("system");
    return (
      <SegmentedControl aria-label="Colour mode" value={mode} onValueChange={setMode}>
        <SegmentedControl.Item value="light" aria-label="Light">
          <Sun />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="system" aria-label="System">
          <Monitor />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="dark" aria-label="Dark">
          <Moon />
        </SegmentedControl.Item>
      </SegmentedControl>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Dark" }));
    await expect(canvas.getByRole("radio", { name: "Dark" })).toBeChecked();
  },
};

/** Small: a 32px well of 24px segments, the target floor (WCAG 2.2 SC 2.5.8). */
export const Small: Story = {
  render: () => (
    <SegmentedControl aria-label="View" size="small" defaultValue="grid">
      <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
      <SegmentedControl.Item value="list">List</SegmentedControl.Item>
    </SegmentedControl>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Grid").closest("label")!.getBoundingClientRect().height).toBe(24);
  },
};
