import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "../avatar";
import { AvatarGroup } from "./AvatarGroup";

describe("AvatarGroup (TDD styled AV3)", () => {
  it("groups avatars under one name", () => {
    render(
      <AvatarGroup aria-label="Reviewers" className="extra">
        <Avatar name="Ana Nugraha" />
        <Avatar name="Budi Santoso" />
      </AvatarGroup>,
    );
    const group = screen.getByRole("group", { name: "Reviewers" });
    expect(group).toHaveClass("scnx-avatar-group", "extra");
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });
});
