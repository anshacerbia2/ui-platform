import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders an h2 with the default recipe classes", () => {
    render(<Heading>Title</Heading>);
    const heading = screen.getByRole("heading", { level: 2, name: "Title" });

    expect(heading).toHaveClass("heading", "heading--size_medium", "heading--weight_bold");
  });

  it("renders the requested level", () => {
    render(<Heading as="h1">Page</Heading>);

    expect(screen.getByRole("heading", { level: 1, name: "Page" })).toBeInTheDocument();
  });
});
