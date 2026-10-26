import { describe, expect, it } from "vitest";
import { computePosition, type PositionInput } from "./position";

const base: PositionInput = {
  anchor: { x: 100, y: 100, width: 80, height: 32 },
  floating: { width: 120, height: 40 },
  viewport: { width: 800, height: 600 },
  placement: "bottom",
  offset: 4,
  padding: 8,
  rtl: false,
};

describe("computePosition (TDD primitives P31)", () => {
  it("places the part on each side, offset from the anchor and centred on it", () => {
    expect(computePosition(base)).toEqual({ x: 80, y: 136, side: "bottom", align: "center" });
    expect(computePosition({ ...base, placement: "top" })).toEqual({ x: 80, y: 56, side: "top", align: "center" });
    expect(computePosition({ ...base, placement: "right" })).toMatchObject({ x: 184, y: 96, side: "right" });
    expect(computePosition({ ...base, placement: "left", anchor: { ...base.anchor, x: 400 } })).toMatchObject({ x: 276, y: 96, side: "left" });
    // Too close to the left edge: the right side has room, so the part flips there.
    expect(computePosition({ ...base, placement: "left" })).toMatchObject({ x: 184, side: "right" });
  });

  it("aligns start and end to the anchor's edges, following the text direction", () => {
    expect(computePosition({ ...base, placement: "bottom-start" }).x).toBe(100);
    expect(computePosition({ ...base, placement: "bottom-end" }).x).toBe(60);
    expect(computePosition({ ...base, placement: "bottom-start", rtl: true }).x).toBe(60);
    expect(computePosition({ ...base, placement: "bottom-end", rtl: true }).x).toBe(100);
    expect(computePosition({ ...base, placement: "right-start" }).y).toBe(100);
    expect(computePosition({ ...base, placement: "right-end" }).y).toBe(92);
  });

  it("flips to the opposite side only when that side has more room", () => {
    const nearBottom = { ...base, anchor: { ...base.anchor, y: 560 } };
    expect(computePosition(nearBottom)).toMatchObject({ side: "top", y: 516 });
    // Neither side fits a tall part; the side that overflows less wins.
    const tall = { ...base, floating: { width: 120, height: 400 }, anchor: { ...base.anchor, y: 250 } };
    expect(computePosition(tall).side).toBe("bottom");
    expect(computePosition({ ...tall, anchor: { ...tall.anchor, y: 330 } }).side).toBe("top");
  });

  it("shifts along the anchor's edge to stay inside the viewport, never over the anchor", () => {
    expect(computePosition({ ...base, anchor: { ...base.anchor, x: 0 } }).x).toBe(8);
    expect(computePosition({ ...base, anchor: { ...base.anchor, x: 760 } }).x).toBe(672);
    // A part wider than the viewport keeps its start edge at the padding.
    expect(computePosition({ ...base, floating: { width: 900, height: 40 } }).x).toBe(8);
    expect(computePosition({ ...base, placement: "right", anchor: { ...base.anchor, y: 590 } }).y).toBe(552);
  });
});
