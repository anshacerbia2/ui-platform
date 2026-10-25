import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("adds the styled classes and keeps the base semantics", () => {
    render(
      <Dialog open onOpenChange={() => {}} className="consumer">
        <Dialog.Title>Delete the payroll run?</Dialog.Title>
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Delete the payroll run?" });
    expect(dialog).toHaveClass("scnx-dialog", "consumer");
    const close = screen.getByRole("button", { name: "Cancel" });
    expect(close).toHaveClass("scnx-button");
    expect(close).toHaveAttribute("data-variant", "secondary");
  });

  it("renders the body, actions, and a named corner close button", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <Dialog.Title>Delete the payroll run?</Dialog.Title>
        <Dialog.Body>Sent payslips stay.</Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close variant="ghost">Cancel</Dialog.Close>
        </Dialog.Actions>
        <Dialog.CloseButton />
      </Dialog>,
    );
    expect(screen.getByText("Sent payslips stay.")).toHaveAttribute("data-part", "body");
    expect(screen.getByRole("button", { name: "Cancel" }).parentElement).toHaveAttribute("data-part", "actions");
    const corner = screen.getByRole("button", { name: "Close" });
    expect(corner).toHaveClass("scnx-icon-button");
    expect(corner).toHaveAttribute("data-variant", "ghost");
    expect(corner).toHaveAttribute("data-size", "small");
    expect(corner).toHaveAttribute("data-corner", "");
    expect(corner.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
