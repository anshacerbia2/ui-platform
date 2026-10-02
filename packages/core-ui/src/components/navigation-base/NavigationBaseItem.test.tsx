import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentPropsWithRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TableOfContentsBase } from "../table-of-contents-base";
import { NavigationBase } from "./NavigationBase";

// TDD primitives P8 (disclosure navigation), P9 (no redundant roles), P10 (TOC IDs).
describe("NavigationBase.Item", () => {
  it("renders a leaf as a native link; the current page has aria-current=page", () => {
    render(
      <NavigationBase aria-label="Main">
        <NavigationBase.Group>
          <NavigationBase.Item href="/people" label="People" isActive />
          <NavigationBase.Item href="/teams" label="Teams" />
        </NavigationBase.Group>
      </NavigationBase>,
    );
    expect(screen.getByRole("link", { name: "People" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Teams" })).not.toHaveAttribute("aria-current");
  });

  it("renders an item with a nested group as a disclosure button, not a menu", async () => {
    render(
      <NavigationBase aria-label="Main">
        <NavigationBase.Group>
          <NavigationBase.Item label="Payroll">
            <NavigationBase.Group>
              <NavigationBase.Item href="/payroll/runs" label="Runs" />
            </NavigationBase.Group>
          </NavigationBase.Item>
        </NavigationBase.Group>
      </NavigationBase>,
    );
    const button = screen.getByRole("button", { name: "Payroll" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(document.querySelector("[role='menu'], [role='menuitem']")).toBeNull();
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const controlled = document.getElementById(button.getAttribute("aria-controls")!);
    expect(controlled?.tagName).toBe("UL");
    expect(controlled).toContainElement(screen.getByRole("link", { name: "Runs" }));
  });

  it("composes a router link through asChild and fills it with the item content", () => {
    const RouterLink = ({ to, ...rest }: { to: string } & ComponentPropsWithRef<"a">) => <a href={to} {...rest} />;
    render(
      <NavigationBase aria-label="Main">
        <NavigationBase.Group>
          <NavigationBase.Item asChild label="Reports" isActive>
            <RouterLink to="/reports" />
          </NavigationBase.Item>
        </NavigationBase.Group>
      </NavigationBase>,
    );
    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveAttribute("href", "/reports");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("disables a link without swallowing the event", () => {
    const parent = vi.fn();
    render(
      <div onClick={parent}>
        <NavigationBase.Group>
          <NavigationBase.Item href="/archive" label="Archive" isDisabled />
        </NavigationBase.Group>
      </div>,
    );
    const link = screen.getByText("Archive").closest("a")!;
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    fireEvent.click(link);
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it("sets no redundant roles on native elements", () => {
    const { container } = render(
      <NavigationBase aria-label="Main">
        <NavigationBase.Group>
          <NavigationBase.Item href="/a" label="A" />
        </NavigationBase.Group>
      </NavigationBase>,
    );
    expect(container.querySelector("nav")).not.toHaveAttribute("role");
    expect(container.querySelector("ul")).not.toHaveAttribute("role");
    expect(container.querySelector("li")).not.toHaveAttribute("role");
  });
});

describe("TableOfContentsBase.Link", () => {
  it("points to its target heading with its own distinct ID", async () => {
    const { container } = render(
      <>
        <h2 id="install">Install</h2>
        <TableOfContentsBase items={[{ id: "install", title: "Install" }]}>
          <TableOfContentsBase.List>
            <TableOfContentsBase.Item>
              <TableOfContentsBase.Link targetId="install" id="toc-install">Install</TableOfContentsBase.Link>
            </TableOfContentsBase.Item>
          </TableOfContentsBase.List>
        </TableOfContentsBase>
      </>,
    );
    const link = screen.getByRole("link", { name: "Install" });
    expect(link).toHaveAttribute("href", "#install");
    expect(link.id).toBe("toc-install");
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    await userEvent.click(link);
    expect(link).toHaveAttribute("aria-current", "location");
  });

  it("lets the consumer's preventDefault keep the library from scrolling", () => {
    const scrollTo = vi.spyOn(window, "scrollTo");
    render(
      <TableOfContentsBase items={[{ id: "usage", title: "Usage" }]}>
        <TableOfContentsBase.Link targetId="usage" onClick={(e) => e.preventDefault()}>Usage</TableOfContentsBase.Link>
      </TableOfContentsBase>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Usage" }));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
