import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
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

/** The raised material: its fill, ring, contact, and ambient shadow. */
export const Secondary: Story = { args: { variant: "secondary" } };

/** No fill at rest; toolbars, dense rows, and dialog dismissals. */
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };

/** Only the confirming action of something destructive. */
export const Danger: Story = { args: { variant: "danger", children: "Delete project" } };

/** Small 28 px (radius element), medium 36 px, and large 44 px (radius control). */
export const Sizes: Story = {
  render: ({ variant }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button variant={variant} size="small">Small</Button>
      <Button variant={variant} size="medium">Medium</Button>
      <Button variant={variant} size="large">Large</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heights = within(canvasElement).getAllByRole("button").map((b) => b.getBoundingClientRect().height);
    await expect(heights).toEqual([28, 36, 44]);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** A disabled secondary keeps the flat ring and takes the disabled fill and label. */
export const SecondaryDisabled: Story = {
  args: { variant: "secondary", disabled: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
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
