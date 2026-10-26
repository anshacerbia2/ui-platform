import { render, screen } from "@testing-library/react";
import { createRef, type ComponentPropsWithRef } from "react";
import { describe, expect, it } from "vitest";
import { LinkBase } from "./LinkBase";

const RouterLink = ({ to, ...props }: ComponentPropsWithRef<"a"> & { to: string }) => <a href={to} data-router="" {...props} />;

describe("LinkBase (TDD primitives P30)", () => {
  it("is a native link with its destination and props", () => {
    render(
      <LinkBase href="/changelog" className="link" target="_blank" rel="noreferrer">
        Changelog
      </LinkBase>,
    );
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveClass("link");
  });

  it("composes a router link with asChild, merging the class and the ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <LinkBase asChild className="link" ref={ref}>
        <RouterLink to="/blog" className="router">
          Blog
        </RouterLink>
      </LinkBase>,
    );
    const link = screen.getByRole("link", { name: "Blog" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("data-slot", "link");
    expect(link).toHaveClass("link", "router");
    expect(ref.current).toBe(link);
  });

  it("requires a destination in anchor mode, at the type level", () => {
    // @ts-expect-error a link without href is not a link
    const missing = <LinkBase>Nowhere</LinkBase>;
    expect(missing).toBeTruthy();
  });
});
