import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a span with the default scheme, emphasis, and size", () => {
    render(<Badge>Beta</Badge>);
    const badge = screen.getByText("Beta");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveClass("scnx-badge");
    expect(badge).toHaveAttribute("data-scheme", "neutral");
    expect(badge).toHaveAttribute("data-emphasis", "subtle");
    expect(badge).toHaveAttribute("data-size", "medium");
  });

  it("selects a scheme, an emphasis, and a size, and keeps the consumer's class", () => {
    render(
      <Badge scheme="danger" emphasis="solid" size="small" className="consumer">
        Failed
      </Badge>,
    );
    const badge = screen.getByText("Failed");
    expect(badge).toHaveClass("scnx-badge", "consumer");
    expect(badge).toHaveAttribute("data-scheme", "danger");
    expect(badge).toHaveAttribute("data-emphasis", "solid");
    expect(badge).toHaveAttribute("data-size", "small");
  });

  it("leads with a hidden status dot only when asked", () => {
    const { rerender } = render(<Badge dot>Live</Badge>);
    const badge = screen.getByText("Live");
    const dot = badge.firstElementChild;
    expect(dot).toHaveAttribute("data-part", "dot");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(badge).toHaveTextContent(/^Live$/);

    rerender(<Badge>Live</Badge>);
    expect(screen.getByText("Live").querySelector("[data-part=dot]")).toBeNull();
  });
});
