import { render, screen } from "@testing-library/react";
import { createRef, type ComponentPropsWithRef } from "react";
import { describe, expect, it } from "vitest";
import { NavigationBarBase } from "./NavigationBarBase";

const RouterLink = ({ to, ...props }: ComponentPropsWithRef<"a"> & { to: string }) => <a href={to} data-router="" {...props} />;

describe("NavigationBarBase.Link (TDD primitives P2, P8)", () => {
  it("is a native link that marks the current page", () => {
    render(
      <>
        <NavigationBarBase.Link href="/docs" current>
          Docs
        </NavigationBarBase.Link>
        <NavigationBarBase.Link href="/blog">Blog</NavigationBarBase.Link>
      </>,
    );
    const docs = screen.getByRole("link", { name: "Docs" });
    expect(docs).toHaveAttribute("href", "/docs");
    expect(docs).toHaveAttribute("aria-current", "page");
    expect(docs).toHaveAttribute("data-slot", "link");
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-current");
  });

  it("composes a router link with asChild, merging the class and the ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <NavigationBarBase.Link asChild current className="bar" ref={ref}>
        <RouterLink to="/blog" className="router">
          Blog
        </RouterLink>
      </NavigationBarBase.Link>,
    );
    const blog = screen.getByRole("link", { name: "Blog" });
    expect(blog).toHaveAttribute("data-router");
    expect(blog).toHaveAttribute("href", "/blog");
    expect(blog).toHaveAttribute("aria-current", "page");
    expect(blog).toHaveClass("bar", "router");
    expect(ref.current).toBe(blog);
  });
});
