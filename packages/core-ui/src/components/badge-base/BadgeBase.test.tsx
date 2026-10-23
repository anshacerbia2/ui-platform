import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { BadgeBase } from "./BadgeBase";

describe("BadgeBase", () => {
  it("renders one span with no role, passing its props through", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <BadgeBase ref={ref} className="tag" data-scheme="success" title="Deployed to production">
        Live
      </BadgeBase>,
    );
    const badge = screen.getByText("Live");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("role");
    expect(badge).toHaveClass("tag");
    expect(badge).toHaveAttribute("data-scheme", "success");
    expect(badge).toHaveAttribute("title", "Deployed to production");
    expect(ref.current).toBe(badge);
  });
});
