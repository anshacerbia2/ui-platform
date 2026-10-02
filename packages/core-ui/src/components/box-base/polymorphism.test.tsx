import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ContainerBase } from "../container-base";
import { FlexBase } from "../flex-base";
import { GridBase } from "../grid-base";
import { HeadingBase } from "../heading-base";
import { ListBase } from "../list-base";
import { TextBase } from "../text-base";
import { BoxBase } from "./BoxBase";

// Closed `as` unions for layout and typography (TDD primitives PRM-006).
describe("closed as unions", () => {
  it("renders the default and each allowed tag, with the ref on the rendered node", () => {
    const ref = createRef<HTMLElement>();
    render(
      <>
        <BoxBase data-testid="box">box</BoxBase>
        <FlexBase as="section" aria-label="Flex region" ref={ref}>flex</FlexBase>
        <GridBase as="nav" aria-label="Grid nav">grid</GridBase>
        <ContainerBase as="main">container</ContainerBase>
        <HeadingBase as="h1">Title</HeadingBase>
        <TextBase as="label" htmlFor="x">Label</TextBase>
      </>,
    );
    expect(screen.getByTestId("box").tagName).toBe("DIV");
    expect(screen.getByRole("region", { name: "Flex region" })).toBe(ref.current);
    expect(screen.getByRole("navigation", { name: "Grid nav" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Label").tagName).toBe("LABEL");
  });

  it("renders lists natively by type, with no asChild", () => {
    render(
      <>
        <ListBase data-testid="ul"><ListBase.Item>a</ListBase.Item></ListBase>
        <ListBase type="ordered" data-testid="ol"><ListBase.Item>b</ListBase.Item></ListBase>
      </>,
    );
    expect(screen.getByTestId("ul").tagName).toBe("UL");
    expect(screen.getByTestId("ol").tagName).toBe("OL");
    expect(screen.getByTestId("ol")).not.toHaveAttribute("type");
  });

  it("leaks no component-only prop to the DOM", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<BoxBase as="aside" data-testid="aside">x</BoxBase>);
    const aside = screen.getByTestId("aside");
    expect(aside.tagName).toBe("ASIDE");
    expect(aside).not.toHaveAttribute("as");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("rejects tags outside each union and asChild, at the type level", () => {
    // @ts-expect-error a layout primitive is not interactive
    void (<BoxBase as="button" />);
    // @ts-expect-error a heading is not a link
    void (<HeadingBase as="a" />);
    // @ts-expect-error layout primitives expose a closed `as`, not asChild
    void (<FlexBase asChild />);
    // @ts-expect-error lists pick ul/ol through type
    void (<ListBase asChild />);
    expect(true).toBe(true);
  });
});
