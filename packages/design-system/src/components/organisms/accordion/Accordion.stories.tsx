import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Accordion } from "./Accordion";

const SECTIONS = [
  { value: "leave", title: "Leave policy", body: "Annual leave accrues monthly and carries over up to ten days." },
  { value: "payroll", title: "Payroll schedule", body: "Payroll runs on the last business day of each month." },
  { value: "benefits", title: "Benefits", body: "Health cover starts on the first day of employment." },
];

const meta = {
  title: "Organisms/Accordion",
  component: Accordion,
  render: (args) => (
    <Accordion {...args}>
      {SECTIONS.map((section) => (
        <Accordion.Item key={section.value} value={section.value}>
          <Accordion.Trigger>{section.title}</Accordion.Trigger>
          <Accordion.Content>
            <p>{section.body}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Payroll schedule" });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText(/last business day/)).toBeVisible());
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
