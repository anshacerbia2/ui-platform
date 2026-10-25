import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./Kbd";

describe("Kbd", () => {
  it("renders one key as a native kbd, keeping its own class", () => {
    render(
      <p>
        Press <Kbd>⌘</Kbd> <Kbd className="extra">K</Kbd>
      </p>,
    );
    const keys = document.querySelectorAll("kbd");
    expect(keys).toHaveLength(2);
    expect(keys[1]).toHaveClass("scnx-kbd", "extra");
    expect(screen.getByText("K").tagName).toBe("KBD");
  });
});
