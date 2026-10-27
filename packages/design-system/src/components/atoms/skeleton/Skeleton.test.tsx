import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton (TDD styled SK1-SK2)", () => {
  it("is a hidden placeholder of the given shape, a text line by default", () => {
    const { container } = render(
      <section aria-busy="true" aria-label="Deployments">
        <Skeleton className="extra" />
        <Skeleton shape="circle" />
      </section>,
    );
    const [line, circle] = container.querySelectorAll(".scnx-skeleton");
    expect(line).toHaveClass("extra");
    expect(line).toHaveAttribute("data-shape", "text");
    expect(line).toHaveAttribute("aria-hidden", "true");
    expect(circle).toHaveAttribute("data-shape", "circle");
  });
});
