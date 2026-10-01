import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, Fragment } from "react";
import { describe, expect, it, vi } from "vitest";
import { Slot, mergeSlotProps } from "./Slot";

describe("Slot", () => {
  it("renders the child with no extra node; child props win; className is slot then child", () => {
    const { container } = render(
      <Slot className="slot" title="slot" data-slot="x">
        <button type="button" className="child" title="child">Go</button>
      </Slot>,
    );
    const button = screen.getByRole("button");
    expect(container.firstElementChild).toBe(button);
    expect(button.className).toBe("slot child");
    expect(button).toHaveAttribute("title", "child");
    expect(button).toHaveAttribute("data-slot", "x");
  });

  it("merges style keys with the child's last", () => {
    render(
      <Slot style={{ color: "red", margin: "1px" }}>
        <span style={{ color: "blue" }}>x</span>
      </Slot>,
    );
    expect(screen.getByText("x")).toHaveStyle({ color: "rgb(0, 0, 255)", margin: "1px" });
  });

  it("runs the child's handler first; preventDefault cancels the slot's", () => {
    const order: string[] = [];
    const slot = vi.fn(() => order.push("slot"));
    const { rerender } = render(
      <Slot onClick={slot}>
        <button type="button" onClick={() => order.push("child")}>Go</button>
      </Slot>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(order).toEqual(["child", "slot"]);

    rerender(
      <Slot onClick={slot}>
        <button type="button" onClick={(e) => e.preventDefault()}>Go</button>
      </Slot>,
    );
    slot.mockClear();
    fireEvent.click(screen.getByRole("button"));
    expect(slot).not.toHaveBeenCalled();
  });

  it("lets a child handler exception propagate and skip the slot's handler", () => {
    const slot = vi.fn();
    const props = mergeSlotProps({ onClick: slot }, { onClick: () => { throw new Error("child failed"); } });
    expect(() => (props.onClick as (e: object) => void)({})).toThrow("child failed");
    expect(slot).not.toHaveBeenCalled();
  });

  it("composes the slot ref with the child ref", () => {
    const slotRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLButtonElement>();
    render(
      <Slot ref={slotRef}>
        <button type="button" ref={childRef}>Go</button>
      </Slot>,
    );
    expect(slotRef.current).toBe(screen.getByRole("button"));
    expect(childRef.current).toBe(screen.getByRole("button"));
  });

  it.each([
    ["no child", undefined, "received 0 children"],
    ["a string", "text", "received a string child"],
    ["a Fragment", <Fragment key="f"><span /></Fragment>, "received a Fragment"],
  ])("rejects %s before cloning", (_, child, message) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Slot>{child as never}</Slot>)).toThrow(message);
    vi.restoreAllMocks();
  });
});
