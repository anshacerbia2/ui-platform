import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

describe("Tabs", () => {
  it("adds the styled class and keeps the base semantics", () => {
    const { container } = render(
      <Tabs defaultValue="a" className="consumer">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs>,
    );
    expect(container.firstElementChild).toHaveClass("scnx-tabs", "consumer");
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "A" })).toBeVisible();
  });
});
