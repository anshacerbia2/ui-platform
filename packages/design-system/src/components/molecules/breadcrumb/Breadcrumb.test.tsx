import { render, screen, within } from "@testing-library/react";
import type { ComponentPropsWithRef } from "react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

const RouterLink = ({ to, ...props }: ComponentPropsWithRef<"a"> & { to: string }) => <a href={to} data-router="" {...props} />;

describe("Breadcrumb (TDD styled BC1-BC2)", () => {
  it("is a labelled nav holding an ordered list of ancestors and the current page", () => {
    render(
      <Breadcrumb className="extra">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/projects">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link asChild>
            <RouterLink to="/projects/acme">Acme</RouterLink>
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>acme-dashboard</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>,
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("scnx-breadcrumb", "extra");
    const list = within(nav).getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "Acme" })).toHaveAttribute("data-router");
    const page = screen.getByText("acme-dashboard");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page.closest("a")).toBeNull();
  });

  it("takes its own label", () => {
    render(
      <Breadcrumb aria-label="Settings path">
        <Breadcrumb.Item>
          <Breadcrumb.Page>Billing</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb>,
    );
    expect(screen.getByRole("navigation", { name: "Settings path" })).toBeInTheDocument();
  });
});
