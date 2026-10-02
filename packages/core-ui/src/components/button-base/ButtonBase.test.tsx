import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type ComponentPropsWithRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ButtonBase } from "./ButtonBase";

/** A router Link that navigates on click unless the event was default-prevented, like React Router and Next.js. */
const RouterLink = ({ to, onClick, children, ref, ...rest }: { to: string } & Omit<ComponentPropsWithRef<"a">, "href">) => {
  const navigate = (window as unknown as { navigate: (to: string) => void }).navigate;
  return (
    <a
      ref={ref}
      href={to}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
};

describe("ButtonBase: button mode", () => {
  it("renders a native button of type button by default", () => {
    render(<ButtonBase>Save</ButtonBase>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("is activated by Enter and Space, natively", async () => {
    const onClick = vi.fn();
    render(<ButtonBase onClick={onClick}>Save</ButtonBase>);
    screen.getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("projects pressed as aria-pressed and never leaks it to the DOM", () => {
    render(<ButtonBase pressed>Bold</ButtonBase>);
    const button = screen.getByRole("button", { name: "Bold" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).not.toHaveAttribute("pressed");
  });

  it("uses native disabled: no activation, out of the tab order", async () => {
    const onClick = vi.fn();
    render(<ButtonBase disabled onClick={onClick}>Save</ButtonBase>);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).not.toHaveFocus();
  });

  it("forwards its ref to the button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ButtonBase ref={ref}>Save</ButtonBase>);
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});

describe("ButtonBase: link mode", () => {
  it("keeps link semantics: an anchor with href, never role=button", () => {
    render(<ButtonBase href="/reports">Reports</ButtonBase>);
    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveAttribute("href", "/reports");
    expect(link).not.toHaveAttribute("role");
  });

  it("disabled: no href, aria-disabled, out of the tab order, activation cancelled but not swallowed", async () => {
    const onClick = vi.fn();
    const parent = vi.fn();
    render(
      <div onClick={parent}>
        <ButtonBase href="/reports" disabled onClick={onClick}>Reports</ButtonBase>
      </div>,
    );
    const link = screen.getByText("Reports");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    expect(parent).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(link).not.toHaveFocus();
  });
});

describe("ButtonBase: asChild", () => {
  it("composes a router Link into one anchor with merged classes and a composed ref", () => {
    (window as unknown as { navigate: (to: string) => void }).navigate = vi.fn();
    const ref = createRef<HTMLElement>();
    render(
      <ButtonBase asChild className="btn" ref={ref}>
        <RouterLink to="/reports" className="link">Reports</RouterLink>
      </ButtonBase>,
    );
    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveClass("btn", "link");
    expect(link.className).toBe("btn link");
    expect(ref.current).toBe(link);
    fireEvent.click(link);
    expect((window as unknown as { navigate: ReturnType<typeof vi.fn> }).navigate).toHaveBeenCalledWith("/reports");
  });

  it("disabled: the router does not navigate, focus leaves the tab order", () => {
    const navigate = vi.fn();
    (window as unknown as { navigate: (to: string) => void }).navigate = navigate;
    render(
      <ButtonBase asChild disabled>
        <RouterLink to="/reports">Reports</RouterLink>
      </ButtonBase>,
    );
    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    fireEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("throws a deterministic error for anything but one element child", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ButtonBase asChild>{"text" as unknown as React.ReactElement}</ButtonBase>)).toThrow("exactly one React element child");
    expect(() =>
      render(
        <ButtonBase asChild>
          {[<a key="1" href="/a">A</a>, <a key="2" href="/b">B</a>] as unknown as React.ReactElement}
        </ButtonBase>,
      ),
    ).toThrow("received 2 children");
    vi.restoreAllMocks();
  });
});

describe("ButtonBase: types", () => {
  it("rejects a toggle state on a link", () => {
    // @ts-expect-error pressed is a button-mode prop
    void (<ButtonBase href="/x" pressed>X</ButtonBase>);
    expect(true).toBe(true);
  });
});
