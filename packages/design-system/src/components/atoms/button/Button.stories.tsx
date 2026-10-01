import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "secondary"] } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    button.blur();
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Link mode keeps native link semantics. */
export const Link: Story = { args: { variant: "secondary", href: "#docs", children: "Read the docs" } };

/** asChild composes one element, for example a router Link, with button styling. */
export const AsChild: Story = {
  args: { asChild: true, children: <a href="#reports">Open reports</a> },
};

/** A disabled link has no href, leaves the tab order, and cancels activation. */
export const DisabledLink: Story = {
  args: { variant: "secondary", href: "#docs", disabled: true, children: "Read the docs" },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText("Read the docs");
    await expect(link).not.toHaveAttribute("href");
    await expect(link).toHaveAttribute("aria-disabled", "true");
  },
};
