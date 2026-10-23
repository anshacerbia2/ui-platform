import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AlertBase } from "./AlertBase";

describe("AlertBase", () => {
  it("is a polite status region by default", () => {
    render(<AlertBase title="Saved">Your changes are live.</AlertBase>);
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("SavedYour changes are live.");
  });

  it("is an assertive alert only when asked", () => {
    render(<AlertBase role="alert">Payment failed.</AlertBase>);
    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed.");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders each part only when given, and hides the icon from assistive technology", () => {
    const { container, rerender } = render(<AlertBase>Message</AlertBase>);
    const parts = () => [...container.querySelectorAll("[data-part]")].map((el) => el.getAttribute("data-part"));
    expect(parts()).toEqual(["content", "body"]);

    rerender(
      <AlertBase icon={<svg data-testid="icon" />} title="Heads up" actions={<a href="#details">Details</a>}>
        Message
      </AlertBase>,
    );
    expect(parts()).toEqual(["icon", "content", "title", "body", "actions"]);
    expect(container.querySelector("[data-part=icon]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Details" })).toBeInTheDocument();
  });

  it("never takes focus and forwards its props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AlertBase ref={ref} className="banner" data-scheme="warning">
        Message
      </AlertBase>,
    );
    const region = screen.getByRole("status");
    expect(region).not.toHaveAttribute("tabindex");
    expect(region).toHaveClass("banner");
    expect(region).toHaveAttribute("data-scheme", "warning");
    expect(ref.current).toBe(region);
  });
});
