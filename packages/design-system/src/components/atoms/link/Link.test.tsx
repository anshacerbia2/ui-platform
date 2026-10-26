import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithRef } from "react";
import { describe, expect, it } from "vitest";
import { Link } from "./Link";

const RouterLink = ({ to, ...props }: ComponentPropsWithRef<"a"> & { to: string }) => <a href={to} data-router="" {...props} />;

describe("Link (TDD styled LK1-LK3)", () => {
  it("is a native link in the primary variant by default", () => {
    render(<Link href="/changelog">Changelog</Link>);
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(link).toHaveClass("scnx-link");
    expect(link).toHaveAttribute("data-variant", "primary");
    expect(link.querySelector("svg")).toBeNull();
  });

  it("adds a hidden icon after the text of an external link, keeping its name", () => {
    render(
      <Link href="https://example.com" external variant="neutral">
        npm package
      </Link>,
    );
    const link = screen.getByRole("link", { name: "npm package" });
    expect(link).toHaveAttribute("data-variant", "neutral");
    expect(link.lastElementChild?.tagName.toLowerCase()).toBe("svg");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("styles a router link with asChild", () => {
    render(
      <Link asChild variant="neutral">
        <RouterLink to="/terms">Terms</RouterLink>
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Terms" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveClass("scnx-link");
    expect(link).toHaveAttribute("data-variant", "neutral");
  });
});
