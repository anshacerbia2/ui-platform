import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders a paragraph with the default recipe classes", () => {
    render(<Text>Body copy</Text>);
    const text = screen.getByText("Body copy");

    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text", "text--variant_body-default", "text--align_left");
    // The composite carries its own weight; `weight` only overrides it.
    expect(text.className).not.toMatch(/text--weight_/);
  });

  it("renders the requested element and merges a consumer class", () => {
    render(
      <Text as="span" className="consumer">
        Inline
      </Text>,
    );
    const text = screen.getByText("Inline");

    expect(text.tagName).toBe("SPAN");
    expect(text).toHaveClass("text", "consumer");
  });
});
