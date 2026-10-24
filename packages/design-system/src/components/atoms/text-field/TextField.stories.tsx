import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TextField } from "./TextField";

const meta = {
  title: "Atoms/TextField",
  component: TextField,
  args: { label: "Email address" },
  argTypes: { type: { control: "select", options: ["text", "email", "password", "search", "tel", "url"] } },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The input is a medium control, 36 px like a medium Button; focus turns its border blue under a flush ring. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email address" });
    await expect(input.getBoundingClientRect().height).toBe(36);
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.type(input, "ana@example.com");
    await expect(input).toHaveValue("ana@example.com");
  },
};

/** A hint is a description, never a placeholder (GOV.UK Text input). */
export const WithDescription: Story = {
  args: { type: "email", description: "We send your payslip to this address." },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email address" });
    await expect(input).toHaveAccessibleDescription("We send your payslip to this address.");
  },
};

/** The error is text, an icon, and `aria-invalid`; the border colour is not the only cue. */
export const WithError: Story = {
  args: { type: "email", description: "We send your payslip to this address.", error: "Enter an email address in the correct format, like name@example.com" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email address" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "We send your payslip to this address. Enter an email address in the correct format, like name@example.com",
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "ana@example.com" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "Email address" })).toBeDisabled();
  },
};

/** Whole numbers use `inputMode="numeric"`, not `type="number"` (TDD primitives P15). */
export const Numeric: Story = {
  args: { label: "Employee number", inputMode: "numeric", description: "Six digits, on your staff card." },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Employee number" });
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAttribute("inputmode", "numeric");
  },
};
