import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, initialsOf } from "./Avatar";

describe("Avatar (TDD styled AV1-AV2)", () => {
  it("takes two initials from a name", () => {
    expect(initialsOf("Ana Nugraha")).toBe("AN");
    expect(initialsOf("Citra Dewi Wulandari")).toBe("CW");
    expect(initialsOf("acme")).toBe("AC");
    expect(initialsOf("  ")).toBe("");
  });

  it("is an image named by the name and its status, showing initials without a picture", () => {
    render(<Avatar name="Ana Nugraha" status="online" size="large" shape="square" className="extra" />);
    const avatar = screen.getByRole("img", { name: "Ana Nugraha, online" });
    expect(avatar).toHaveClass("scnx-avatar", "extra");
    expect(avatar).toHaveAttribute("data-size", "large");
    expect(avatar).toHaveAttribute("data-shape", "square");
    expect(avatar.querySelector("[data-part=initials]")).toHaveTextContent("AN");
    expect(avatar.querySelector("[data-part=status]")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the picture, and falls back to the initials when it fails", () => {
    render(<Avatar name="Budi Santoso" src="/budi.jpg" />);
    const avatar = screen.getByRole("img", { name: "Budi Santoso" });
    const picture = avatar.querySelector("img")!;
    expect(picture).toHaveAttribute("alt", "");
    fireEvent.error(picture);
    expect(avatar.querySelector("img")).toBeNull();
    expect(avatar).toHaveTextContent("BS");
  });

  it("is hidden from assistive technology when decorative", () => {
    const { container } = render(
      <p>
        <Avatar name="Budi Santoso" decorative /> Budi Santoso
      </p>,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector(".scnx-avatar")).toHaveAttribute("aria-hidden", "true");
  });
});
