import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TableOfContentsBase } from "./TableOfContentsBase";
import type { TableOfContentsBaseRootProps } from "./types";

const items = [
  { id: "intro", title: "Intro" },
  { id: "usage", title: "Usage" },
];

const Toc = (props: Omit<TableOfContentsBaseRootProps, "items">) => (
  <TableOfContentsBase items={items} navbarOffset={0} aria-label="Contents" {...props}>
    <TableOfContentsBase.List>
      {items.map((item) => (
        <TableOfContentsBase.Item key={item.id}>
          <TableOfContentsBase.Link targetId={item.id}>{item.title}</TableOfContentsBase.Link>
        </TableOfContentsBase.Item>
      ))}
    </TableOfContentsBase.List>
  </TableOfContentsBase>
);

const current = () => screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current") === "location").map((link) => link.textContent);

describe("TableOfContentsBase active section (TDD primitives P27)", () => {
  beforeEach(() => {
    for (const { id } of items) {
      const heading = document.createElement("h2");
      heading.id = id;
      document.body.append(heading);
    }
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });
  afterEach(() => {
    document.querySelectorAll("h2").forEach((h) => h.remove());
  });

  it("starts at the first item, or at defaultActiveId, which does not reach the nav element", () => {
    const { unmount } = render(<Toc />);
    expect(current()).toEqual(["Intro"]);
    unmount();

    render(<Toc defaultActiveId="usage" />);
    expect(current()).toEqual(["Usage"]);
    const nav = screen.getByRole("navigation", { name: "Contents" });
    for (const attribute of ["defaultactiveid", "activeid", "initialactiveid"]) expect(nav).not.toHaveAttribute(attribute);
  });

  it("follows a link when uncontrolled and reports the change", () => {
    const onActiveIdChange = vi.fn();
    render(<Toc onActiveIdChange={onActiveIdChange} />);
    fireEvent.click(screen.getByRole("link", { name: "Usage" }));
    expect(current()).toEqual(["Usage"]);
    expect(onActiveIdChange).toHaveBeenCalledExactlyOnceWith("usage");
  });

  it("renders the controlled activeId, reports the requested one, and moves only when the owner does", () => {
    const onActiveIdChange = vi.fn();
    const { rerender } = render(<Toc activeId="intro" onActiveIdChange={onActiveIdChange} />);
    fireEvent.click(screen.getByRole("link", { name: "Usage" }));
    expect(onActiveIdChange).toHaveBeenCalledExactlyOnceWith("usage");
    expect(current()).toEqual(["Intro"]);

    rerender(<Toc activeId="usage" onActiveIdChange={onActiveIdChange} />);
    expect(current()).toEqual(["Usage"]);
    rerender(<Toc activeId={null} onActiveIdChange={onActiveIdChange} />);
    expect(current()).toEqual([]);
  });

  it("works as a controlled pair with state", () => {
    const Controlled = () => {
      const [activeId, setActiveId] = useState<string | null>("intro");
      return <Toc activeId={activeId} onActiveIdChange={setActiveId} />;
    };
    render(<Controlled />);
    fireEvent.click(screen.getByRole("link", { name: "Usage" }));
    expect(current()).toEqual(["Usage"]);
  });
});
