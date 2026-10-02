import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode, useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CollapsibleBase } from "../collapsible-base";
import { AccordionBase } from "./AccordionBase";
import type { AccordionBaseRootProps } from "./types";

const SECTIONS = ["a", "b", "c"];

const Accordion = (props: Partial<AccordionBaseRootProps> & { onOpen?: Record<string, (open: boolean) => void> }) => {
  const { onOpen, ...root } = props;
  return (
    <AccordionBase disabledAnimations {...root}>
      {SECTIONS.map((value) => (
        <AccordionBase.Item key={value} value={value} disabled={value === "c"} onOpenChange={onOpen?.[value]}>
          <AccordionBase.Trigger>Section {value}</AccordionBase.Trigger>
          <AccordionBase.Content>{`Body ${value}`}</AccordionBase.Content>
        </AccordionBase.Item>
      ))}
    </AccordionBase>
  );
};

const trigger = (value: string) => screen.getByRole("button", { name: `Section ${value}` });

describe("AccordionBase behavior matrix", () => {
  it("trigger is a native button controlling a labelled region with unique paired IDs", () => {
    render(<><Accordion defaultValue="a" /><Accordion defaultValue="a" /></>);
    const [first, second] = screen.getAllByRole("button", { name: "Section a" });
    const region = screen.getAllByRole("region", { name: "Section a" })[0];
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(first.getAttribute("aria-controls")).toBe(region.id);
    expect(region.getAttribute("aria-labelledby")).toBe(first.id);
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first.id).not.toBe(second.id);
  });

  it("single: opening one section closes the open one; callbacks fire once per change", async () => {
    const onValueChange = vi.fn();
    const onOpen = { a: vi.fn(), b: vi.fn() };
    render(<Accordion defaultValue="a" onValueChange={onValueChange} onOpen={onOpen} />);
    expect(onOpen.a).not.toHaveBeenCalled();
    await userEvent.click(trigger("b"));
    expect(trigger("a")).toHaveAttribute("aria-expanded", "false");
    expect(trigger("b")).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("Body a")).toBeNull();
    expect(screen.getByText("Body b")).toBeVisible();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(onOpen.a).toHaveBeenCalledWith(false);
    expect(onOpen.b).toHaveBeenCalledWith(true);
  });

  it("is operated by keyboard through the native button (Enter and Space)", async () => {
    render(<Accordion type="multiple" />);
    trigger("a").focus();
    await userEvent.keyboard("{Enter}");
    expect(trigger("a")).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    expect(trigger("a")).toHaveAttribute("aria-expanded", "false");
  });

  it("not collapsible: the open section's trigger is aria-disabled and stays open", async () => {
    render(<Accordion defaultValue="a" collapsible={false} />);
    expect(trigger("a")).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(trigger("a"));
    expect(trigger("a")).toHaveAttribute("aria-expanded", "true");
  });

  it("a disabled item does not change state", async () => {
    render(<Accordion />);
    expect(trigger("c")).toBeDisabled();
    await userEvent.click(trigger("c"));
    expect(trigger("c")).toHaveAttribute("aria-expanded", "false");
  });

  it("controlled: reports the intent and renders only what the parent passes", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Accordion value="a" onValueChange={onValueChange} />);
    await userEvent.click(trigger("b"));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(trigger("a")).toHaveAttribute("aria-expanded", "true");
    rerender(<Accordion value="b" onValueChange={onValueChange} />);
    expect(trigger("b")).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("the consumer's onClick runs first and preventDefault cancels the toggle", () => {
    render(
      <AccordionBase disabledAnimations>
        <AccordionBase.Item value="a">
          <AccordionBase.Trigger onClick={(e) => e.preventDefault()}>Section a</AccordionBase.Trigger>
          <AccordionBase.Content>Body a</AccordionBase.Content>
        </AccordionBase.Item>
      </AccordionBase>,
    );
    fireEvent.click(trigger("a"));
    expect(trigger("a")).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the default value on the server", () => {
    const html = renderToString(<Accordion defaultValue="b" />);
    expect(html).toContain("Body b");
    expect(html).not.toContain("Body a");
  });

  it("an item's defaultOpen applies on the first render", () => {
    render(
      <CollapsibleBase disabledAnimations>
        <CollapsibleBase.Item defaultOpen>
          <CollapsibleBase.Trigger>Details</CollapsibleBase.Trigger>
          <CollapsibleBase.Content>Shown</CollapsibleBase.Content>
        </CollapsibleBase.Item>
      </CollapsibleBase>,
    );
    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Shown")).toBeVisible();
  });

  it("an item-controlled open state reports intent only", async () => {
    const Controlled = () => {
      const [open, setOpen] = useState(false);
      return (
        <CollapsibleBase disabledAnimations>
          <CollapsibleBase.Item open={open} onOpenChange={setOpen}>
            <CollapsibleBase.Trigger>Code</CollapsibleBase.Trigger>
            <CollapsibleBase.Content>source</CollapsibleBase.Content>
          </CollapsibleBase.Item>
        </CollapsibleBase>
      );
    };
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Code" }));
    expect(screen.getByText("source")).toBeVisible();
  });

  it("diagnoses a duplicate value and a controlled/uncontrolled switch", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <AccordionBase>
        <AccordionBase.Item value="x"><AccordionBase.Trigger>One</AccordionBase.Trigger></AccordionBase.Item>
        <AccordionBase.Item value="x"><AccordionBase.Trigger>Two</AccordionBase.Trigger></AccordionBase.Item>
      </AccordionBase>,
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('duplicate item value "x"'));
    const { rerender } = render(<Accordion value="a" />);
    rerender(<Accordion />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("switched from controlled to uncontrolled"));
    error.mockRestore();
  });

  it("keeps registrations balanced under Strict Mode and rapid remounts", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const Remount = () => {
      const [key, setKey] = useState(0);
      return (
        <AccordionBase disabledAnimations>
          <button type="button" onClick={() => setKey((k) => k + 1)}>remount</button>
          <AccordionBase.Item key={key} value="a">
            <AccordionBase.Trigger>Section a</AccordionBase.Trigger>
            <AccordionBase.Content>Body a</AccordionBase.Content>
          </AccordionBase.Item>
        </AccordionBase>
      );
    };
    render(<StrictMode><Remount /></StrictMode>);
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole("button", { name: "remount" }));
    await userEvent.click(trigger("a"));
    expect(trigger("a")).toHaveAttribute("aria-expanded", "true");
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("duplicate"));
    error.mockRestore();
  });

  it("keeps the trigger/region pair resolvable when a consumer passes an id (PRM-004)", () => {
    const stray = { id: "consumer-id" } as object;
    render(
      <AccordionBase disabledAnimations defaultValue="a">
        <AccordionBase.Item value="a">
          <AccordionBase.Trigger {...stray}>Section a</AccordionBase.Trigger>
          <AccordionBase.Content {...stray}>Body a</AccordionBase.Content>
        </AccordionBase.Item>
      </AccordionBase>,
    );
    const button = trigger("a");
    const region = document.getElementById(button.getAttribute("aria-controls")!);
    expect(region).not.toBeNull();
    expect(document.getElementById(region!.getAttribute("aria-labelledby")!)).toBe(button);
  });

  it("throws a named error for a part outside its item", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AccordionBase.Trigger>Orphan</AccordionBase.Trigger>)).toThrow("must be used within a disclosure item");
    vi.restoreAllMocks();
  });

  it("closes through the transition when animations run, then unmounts the region", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<Accordion defaultValue="a" disabledAnimations={false} />);
    fireEvent.click(trigger("a"));
    expect(trigger("a")).toHaveAttribute("aria-expanded", "false");
    act(() => vi.runAllTimers());
    expect(within(document.body).queryByText("Body a")).toBeNull();
    vi.useRealTimers();
  });
});
