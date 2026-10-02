// TDD theme THM-009: server markup carries no style attribute the library
// computes, because a strict CSP (no 'unsafe-inline') blocks style attributes.
// Computed values apply after hydration; until then a closed transition is
// `hidden`. Consumer-provided `style` props pass through unchanged.
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BehaviorFixtures } from "../test/behavior-fixtures";
import { AccordionBase } from "./components/accordion-base";
import { ButtonBase } from "./components/button-base";
import { NavigationBase } from "./components/navigation-base";
import { SidebarBaseRoot, SidebarBaseToggle } from "./components/sidebar-base";
import { TableOfContentsBase } from "./components/table-of-contents-base";
import { TransitionBase } from "./components/transition-base";

const components = { ButtonBase, AccordionBase, NavigationBase, TableOfContentsBase, SidebarBaseRoot, SidebarBaseToggle };

const Page = () => (
  <div>
    <BehaviorFixtures components={components} />
    <TransitionBase open={false} styleFrom={{ opacity: 0 }} styleTo={{ opacity: 1 }} data-fixture="closed">
      Closed
    </TransitionBase>
    <TransitionBase open styleFrom={{ opacity: 0 }} styleTo={{ opacity: 1 }} data-fixture="open">
      Open
    </TransitionBase>
  </div>
);

describe("server markup under strict CSP", () => {
  it("contains no style attribute and hides a closed transition", () => {
    const html = renderToString(<Page />);
    expect(html).not.toMatch(/\sstyle="/);
    const closedTag = html.match(/<div[^>]*data-fixture="closed"[^>]*>/)?.[0] ?? "";
    expect(closedTag).toContain('hidden=""');
    expect(html.match(/<div[^>]*data-fixture="open"[^>]*>/)?.[0]).toContain('hidden=""');
  });

  it("keeps a consumer-provided style", () => {
    const html = renderToString(
      <TransitionBase open={false} style={{ color: "red" }}>
        x
      </TransitionBase>,
    );
    expect(html).toContain('style="color:red"');
  });

  it("applies computed values after hydration", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Page />);
    document.body.append(container);
    await act(async () => {
      hydrateRoot(container, <Page />);
    });
    const closed = container.querySelector<HTMLElement>("[data-fixture='closed']")!;
    expect(closed.hidden).toBe(false);
    expect(closed.style.opacity).toBe("0");
    const item = container.querySelector<HTMLElement>("[data-inventory='NavigationBase'] li[data-index='0']")!;
    expect(item.style.getPropertyValue("--item-index")).toBe("0");
    container.remove();
  });
});
