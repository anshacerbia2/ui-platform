import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button with the styled class, default variant, and default size", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("scnx-button");
    expect(button).toHaveAttribute("data-variant", "primary");
    expect(button).toHaveAttribute("data-size", "medium");
  });

  it("forwards the variant and size and merges a consumer class", () => {
    render(
      <Button variant="danger" size="small" className="consumer">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "small");
    expect(button).toHaveClass("scnx-button", "consumer");
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Submit" });

    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders an anchor when href is provided", () => {
    render(<Button href="/docs">Docs</Button>);
    const link = screen.getByText("Docs");

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("scnx-button");
  });
});
