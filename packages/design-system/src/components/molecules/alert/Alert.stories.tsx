import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../../atoms/button";
import { Alert } from "./Alert";
import type { AlertScheme } from "./types";

const SCHEMES: AlertScheme[] = ["neutral", "info", "success", "warning", "danger"];

const Info = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  args: { title: "Deployed", children: "Version 2.0 is live in every region." },
  argTypes: { scheme: { control: "select", options: SCHEMES }, role: { control: "inline-radio", options: ["status", "alert"] } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { icon: <Info /> } };

/** Every scheme with its icon, title, message, and an action. */
export const Schemes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      {SCHEMES.map((scheme) => (
        <Alert {...args} key={scheme} scheme={scheme} icon={<Info />} title={`A ${scheme} message`} actions={<Button variant="secondary" href="#details">Details</Button>}>
          The message explains what happened and what to do next.
        </Alert>
      ))}
    </div>
  ),
};

/** `role="alert"` for an important message inserted while the page is in use; it is announced, and focus stays where it was. */
export const Assertive: Story = {
  render: () => {
    const [failed, setFailed] = useState(false);
    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <Button onClick={() => setFailed(true)}>Pay now</Button>
        {failed && (
          <Alert scheme="danger" role="alert" icon={<Info />} title="Payment failed">
            The card was declined. Check its details and retry.
          </Alert>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pay = canvas.getByRole("button", { name: "Pay now" });
    await userEvent.click(pay);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Payment failed");
    await expect(pay).toHaveFocus();
  },
};
