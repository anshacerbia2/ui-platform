import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders a column flex container with the stack class", () => {
    render(
      <Stack className="consumer">
        <span>Child</span>
      </Stack>,
    );
    const stack = screen.getByText("Child").parentElement;

    expect(stack).toHaveClass("scnx-stack", "flex", "flex--direction_col", "consumer");
  });
});
