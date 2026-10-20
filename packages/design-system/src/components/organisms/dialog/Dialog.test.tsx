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
    expect(close).toHaveClass("scnx-btn");
    expect(close).toHaveAttribute("data-variant", "secondary");
  });
});
