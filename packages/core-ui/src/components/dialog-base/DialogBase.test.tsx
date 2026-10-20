import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DialogBase } from "./DialogBase";

// jsdom has no showModal(); test/setup.ts stubs open, close, and Escape.
// Modality, inertness, and focus return are verified in browsers (P16).

function Harness({ initial = false, onOpenChange }: { initial?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <DialogBase
        open={open}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          setOpen(next);
        }}
      >
        <DialogBase.Title>Delete the payroll run?</DialogBase.Title>
        <DialogBase.Description>The run and its payslips are removed.</DialogBase.Description>
        <DialogBase.Close>Cancel</DialogBase.Close>
      </DialogBase>
    </>
  );
}

describe("DialogBase (TDD primitives P16)", () => {
  it("never renders the open attribute while closed", () => {
    const { container } = render(<Harness />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toHaveAttribute("data-state", "closed");
  });

  it("opens through showModal() and is named and described by its parts", async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(showModal).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole("dialog", { name: "Delete the payroll run?" });
    expect(dialog).toHaveAccessibleDescription("The run and its payslips are removed.");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).not.toHaveAttribute("aria-modal");
    showModal.mockRestore();
  });

  it("reports false when Close is pressed", async () => {
    const onOpenChange = vi.fn();
    render(<Harness initial onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("reports false on Escape", async () => {
    const onOpenChange = vi.fn();
    render(<Harness initial onOpenChange={onOpenChange} />);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.querySelector("dialog")).toHaveAttribute("data-state", "closed");
  });

  it("closes when open becomes false", () => {
    const close = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { rerender } = render(
      <DialogBase open onOpenChange={() => {}}>
        <DialogBase.Title>Title</DialogBase.Title>
      </DialogBase>,
    );
    rerender(
      <DialogBase open={false} onOpenChange={() => {}}>
        <DialogBase.Title>Title</DialogBase.Title>
      </DialogBase>,
    );
    expect(close).toHaveBeenCalled();
    close.mockRestore();
  });

  it("uses aria-label instead of a title, and drops aria-describedby without a description", () => {
    const { container } = render(<DialogBase open aria-label="Quick actions" onOpenChange={() => {}} />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("aria-label", "Quick actions");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
    expect(dialog).not.toHaveAttribute("aria-describedby");
  });

  it("lets the Close handler prevent closing", async () => {
    const onOpenChange = vi.fn();
    render(
      <DialogBase open onOpenChange={onOpenChange}>
        <DialogBase.Title>Unsaved changes</DialogBase.Title>
        <DialogBase.Close onClick={(event) => event.preventDefault()}>Close</DialogBase.Close>
      </DialogBase>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("is controlled: Close reports false at once but leaves an owner-kept dialog open", async () => {
    const onOpenChange = vi.fn();
    render(
      <DialogBase open onOpenChange={onOpenChange}>
        <DialogBase.Title>Saving</DialogBase.Title>
        <DialogBase.Close>Close</DialogBase.Close>
      </DialogBase>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.querySelector("dialog")).toHaveAttribute("open");
  });

  it("ignores a late close event once the dialog has been opened again", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <DialogBase open onOpenChange={onOpenChange}>
        <DialogBase.Title>Reopened</DialogBase.Title>
      </DialogBase>,
    );
    container.querySelector("dialog")!.dispatchEvent(new Event("close"));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("requires its parts to be inside DialogBase", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<DialogBase.Title>Orphan</DialogBase.Title>)).toThrow("DialogBase.Title must be rendered inside DialogBase");
    error.mockRestore();
  });
});
