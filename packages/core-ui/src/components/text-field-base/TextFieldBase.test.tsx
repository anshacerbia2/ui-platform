import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextFieldBase } from "./TextFieldBase";

describe("TextFieldBase (TDD primitives P15)", () => {
  it("names the input by its visible label", () => {
    render(<TextFieldBase label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "text");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("describes the input by the description, then the error", () => {
    render(<TextFieldBase id="email" label="Email" description="We send the payslip here." error="Enter an email address" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-describedby", "email-description email-error");
    expect(input).toHaveAccessibleDescription("We send the payslip here. Enter an email address");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(document.getElementById("email-error")).toHaveTextContent("Enter an email address");
  });

  it("marks the root invalid only while an error is present", () => {
    const { container, rerender } = render(<TextFieldBase label="Name" error="Enter your name" />);
    expect(container.firstElementChild).toHaveAttribute("data-invalid", "");
    rerender(<TextFieldBase label="Name" />);
    expect(container.firstElementChild).not.toHaveAttribute("data-invalid");
    expect(screen.getByRole("textbox", { name: "Name" })).not.toHaveAttribute("aria-invalid");
  });

  it("generates a unique id per field when none is given", () => {
    render(
      <>
        <TextFieldBase label="First" description="Hint one" />
        <TextFieldBase label="Second" description="Hint two" />
      </>,
    );
    const first = screen.getByRole("textbox", { name: "First" });
    const second = screen.getByRole("textbox", { name: "Second" });
    expect(first.id).not.toBe(second.id);
    expect(first).toHaveAccessibleDescription("Hint one");
    expect(second).toHaveAccessibleDescription("Hint two");
  });

  it("keeps the native disabled and required attributes", () => {
    const { container } = render(<TextFieldBase label="Code" disabled required />);
    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "");
  });

  it("passes input props, the ref, and the text-like type through", async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<TextFieldBase ref={ref} label="Phone" type="tel" inputMode="numeric" name="phone" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("inputmode", "numeric");
    await userEvent.type(input, "12");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("puts the class on the root, not the input", () => {
    const { container } = render(<TextFieldBase label="City" className="field" />);
    expect(container.firstElementChild).toHaveClass("field");
    expect(screen.getByRole("textbox", { name: "City" })).not.toHaveClass("field");
  });
});
