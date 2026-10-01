import { act, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransitionBase } from "./TransitionBase";
import { TIMEOUT_CAP_MS, TIMEOUT_SAFETY_MARGIN_MS, computedTiming, fallbackTimeout, parseTimeList } from "./timing";

const FROM = { height: 0, opacity: 0 };
const TO = { height: "auto", opacity: 1 };

let timing: { transitionDuration: string; transitionDelay: string; animationDuration: string; animationDelay: string };
let reducedMotion: boolean;

beforeEach(() => {
  // Fake only timers; test/setup.ts runs animation frames synchronously.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  timing = { transitionDuration: "0.3s", transitionDelay: "0s", animationDuration: "0s", animationDelay: "0s" };
  reducedMotion = false;
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((el) => Object.assign(real(el), timing));
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: query.includes("reduce") && reducedMotion, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function setup(props: Partial<Parameters<typeof TransitionBase>[0]> = {}) {
  const onOpened = vi.fn();
  const onClosed = vi.fn();
  const view = render(
    <TransitionBase open={false} styleFrom={FROM} styleTo={TO} onOpened={onOpened} onClosed={onClosed} data-testid="t" {...props}>
      <span data-testid="child">content</span>
    </TransitionBase>,
  );
  const node = view.getByTestId("t");
  const rerender = (next: Partial<Parameters<typeof TransitionBase>[0]>) =>
    view.rerender(
      <TransitionBase open={false} styleFrom={FROM} styleTo={TO} onOpened={onOpened} onClosed={onClosed} data-testid="t" {...props} {...next}>
        <span data-testid="child">content</span>
      </TransitionBase>,
    );
  return { ...view, node, rerender, onOpened, onClosed };
}

describe("timing", () => {
  it("parses CSS time lists; invalid and negative entries are 0", () => {
    expect(parseTimeList("0.3s, 200ms")).toEqual([300, 200]);
    expect(parseTimeList("-1s, NaNs, 1e3ms")).toEqual([0, 0, 0]);
    expect(parseTimeList("")).toEqual([0]);
  });

  it("pairs durations with repeating delays and takes the longer of transition and animation", () => {
    expect(computedTiming({ transitionDuration: "100ms, 200ms, 300ms", transitionDelay: "50ms, 0s", animationDuration: "0s", animationDelay: "0s" })).toBe(350);
    expect(computedTiming({ transitionDuration: "100ms, 200ms", transitionDelay: "500ms, 0s", animationDuration: "0s", animationDelay: "0s" })).toBe(600);
    expect(computedTiming({ transitionDuration: "0s", transitionDelay: "0s", animationDuration: "1s", animationDelay: "0.5s" })).toBe(1500);
  });

  it("adds the safety margin, caps the fallback, and settles zero now", () => {
    expect(fallbackTimeout(300)).toBe(300 + TIMEOUT_SAFETY_MARGIN_MS);
    expect(fallbackTimeout(60_000)).toBe(TIMEOUT_CAP_MS);
    expect(fallbackTimeout(0)).toBe(0);
    expect(fallbackTimeout(Number.NaN)).toBe(0);
  });
});

describe("TransitionBase", () => {
  it("opens through entering and settles on its own transitionend, once", () => {
    const { node, rerender, onOpened } = setup();
    expect(node).toHaveAttribute("data-state", "closed");
    act(() => rerender({ open: true }));
    expect(node).toHaveAttribute("data-state", "entering");

    // A bubbled child event and an unowned property do not complete it.
    act(() => {
      fireEvent.transitionEnd(node.firstElementChild!, { propertyName: "height" });
      fireEvent.transitionEnd(node, { propertyName: "color" });
    });
    expect(node).toHaveAttribute("data-state", "entering");

    act(() => fireEvent.transitionEnd(node, { propertyName: "height" }));
    expect(node).toHaveAttribute("data-state", "settled");
    expect(node.style.height).toBe("auto");
    act(() => fireEvent.transitionEnd(node, { propertyName: "opacity" }));
    act(() => vi.runAllTimers());
    expect(onOpened).toHaveBeenCalledTimes(1);
  });

  it("settles through the bounded timeout when no completion event arrives", () => {
    const { node, rerender, onOpened } = setup();
    act(() => rerender({ open: true }));
    act(() => vi.advanceTimersByTime(300 + TIMEOUT_SAFETY_MARGIN_MS - 1));
    expect(node).toHaveAttribute("data-state", "entering");
    act(() => vi.advanceTimersByTime(1));
    expect(node).toHaveAttribute("data-state", "settled");
    expect(onOpened).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("caps the fallback for a very long computed timing", () => {
    timing.transitionDuration = "60s";
    const { node, rerender } = setup();
    act(() => rerender({ open: true }));
    act(() => vi.advanceTimersByTime(TIMEOUT_CAP_MS));
    expect(node).toHaveAttribute("data-state", "settled");
  });

  it("settles a zero-duration transition at once", () => {
    timing.transitionDuration = "0s";
    const { node, rerender, onOpened } = setup();
    act(() => rerender({ open: true }));
    expect(node).toHaveAttribute("data-state", "settled");
    expect(onOpened).toHaveBeenCalledTimes(1);
  });

  it("reverses an interrupted intent; only the completed intent calls back", () => {
    const { node, rerender, onOpened, onClosed } = setup();
    act(() => rerender({ open: true }));
    act(() => rerender({ open: false }));
    expect(node).toHaveAttribute("data-state", "exiting");
    expect(node).toHaveAttribute("data-interrupted", "true");
    act(() => vi.runAllTimers());
    expect(node).toHaveAttribute("data-state", "closed");
    expect(node).not.toHaveAttribute("data-interrupted");
    expect(onOpened).not.toHaveBeenCalled();
    expect(onClosed).toHaveBeenCalledTimes(1);

    act(() => rerender({ open: true }));
    act(() => rerender({ open: false }));
    act(() => rerender({ open: true }));
    act(() => vi.runAllTimers());
    expect(node).toHaveAttribute("data-state", "settled");
    expect(onOpened).toHaveBeenCalledTimes(1);
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("settles synchronously without layout reads when disabled or under reduced motion", () => {
    const layout = vi.spyOn(Element.prototype, "getBoundingClientRect");
    const frames = vi.mocked(requestAnimationFrame);
    frames.mockClear();

    const disabled = setup({ open: true, disabled: true });
    expect(disabled.node).toHaveAttribute("data-state", "settled");
    expect(disabled.onOpened).toHaveBeenCalledTimes(1);
    act(() => disabled.rerender({ open: false }));
    expect(disabled.node).toHaveAttribute("data-state", "closed");
    expect(disabled.onClosed).toHaveBeenCalledTimes(1);
    disabled.unmount();

    reducedMotion = true;
    const reduced = setup();
    act(() => reduced.rerender({ open: true }));
    expect(reduced.node).toHaveAttribute("data-state", "settled");
    expect(reduced.node.style.transition).toBe("none");
    expect(reduced.onOpened).toHaveBeenCalledTimes(1);

    expect(layout).not.toHaveBeenCalled();
    expect(frames).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("fires nothing after an unmount mid-transition and leaves no timer or listener", () => {
    const { node, rerender, unmount, onOpened, onClosed } = setup();
    const removed = vi.spyOn(node, "removeEventListener");
    act(() => rerender({ open: true }));
    unmount();
    act(() => vi.runAllTimers());
    expect(onOpened).not.toHaveBeenCalled();
    expect(onClosed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(removed.mock.calls.map(([type]) => type).sort()).toEqual(["animationend", "transitionend"]);
  });

  it("calls back once under Strict Mode", () => {
    const onOpened = vi.fn();
    render(
      <StrictMode>
        <TransitionBase open disabled styleFrom={FROM} styleTo={TO} onOpened={onOpened} />
      </StrictMode>,
    );
    const animated = vi.fn();
    render(
      <StrictMode>
        <TransitionBase open styleFrom={FROM} styleTo={TO} onOpened={animated} />
      </StrictMode>,
    );
    act(() => vi.runAllTimers());
    expect(onOpened).toHaveBeenCalledTimes(1);
    expect(animated).toHaveBeenCalledTimes(1);
  });

  it("retargets new open styles without a second onOpened", () => {
    const { node, rerender, onOpened } = setup();
    act(() => rerender({ open: true }));
    act(() => vi.runAllTimers());
    expect(onOpened).toHaveBeenCalledTimes(1);
    act(() => rerender({ open: true, styleTo: { height: 0, opacity: 1 } }));
    expect(node).toHaveAttribute("data-state", "entering");
    act(() => vi.runAllTimers());
    expect(node).toHaveAttribute("data-state", "settled");
    expect(node.style.height).toBe("0px");
    expect(onOpened).toHaveBeenCalledTimes(1);
  });

  it("marks data-mounted once it has settled open", () => {
    const { node, rerender } = setup();
    expect(node).not.toHaveAttribute("data-mounted");
    act(() => rerender({ open: true }));
    act(() => vi.runAllTimers());
    expect(node).toHaveAttribute("data-mounted", "true");
  });
});
