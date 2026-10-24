import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../atoms/button";
import { Dialog } from "./Dialog";

const DeleteRun = ({ initial = false }: { initial?: boolean }) => {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Delete run
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Title>Delete the payroll run?</Dialog.Title>
        <Dialog.Description>The run and its payslips are removed. This cannot be undone.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close variant="ghost">Cancel</Dialog.Close>
          <Button variant="danger" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </Dialog.Actions>
        <Dialog.CloseButton />
      </Dialog>
    </>
  );
};

const meta = {
  title: "Organisms/Dialog",
  component: Dialog,
  args: { open: false, onOpenChange: () => {} },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opens through showModal(): focus moves in; a close request closes it; focus
 * returns to the opener. Story events are synthetic, so the close request is
 * the platform's own requestClose() (the path Escape takes); real Escape key
 * input is verified by the packed behavior matrix in three engines.
 */
export const OpenAndCloseRequest: Story = {
  render: () => <DeleteRun />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const opener = page.getByRole("button", { name: "Delete run" });
    await userEvent.click(opener);
    const dialog = await page.findByRole("dialog", { name: "Delete the payroll run?" });
    await expect(dialog).toHaveAttribute("open");
    await expect(dialog).toHaveAccessibleDescription("The run and its payslips are removed. This cannot be undone.");
    await waitFor(() => expect(dialog.contains(dialog.ownerDocument.activeElement)).toBe(true));
    (dialog as HTMLDialogElement & { requestClose: () => void }).requestClose();
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    await expect(opener).toHaveFocus();
  },
};

/** The corner close button closes it the same way; its name defaults to "Close". */
export const CornerClose: Story = {
  render: () => <DeleteRun />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const opener = page.getByRole("button", { name: "Delete run" });
    await userEvent.click(opener);
    await userEvent.click(await page.findByRole("button", { name: "Close" }));
    await waitFor(() => expect(page.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open"));
    await expect(opener).toHaveFocus();
  },
};

/** Close closes it the same way. */
export const CloseButton: Story = {
  render: () => <DeleteRun />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const opener = page.getByRole("button", { name: "Delete run" });
    await userEvent.click(opener);
    await userEvent.click(await page.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(page.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open"));
    await expect(opener).toHaveFocus();
  },
};

/** Open on first render: showModal() runs after hydration. */
export const InitiallyOpen: Story = { render: () => <DeleteRun initial /> };
