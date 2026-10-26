// Floating placement (TDD primitives P31): where a floating part goes beside
// its anchor, as a pure function of measured boxes, so it is unit-tested
// without layout. Internal: not a public entry.

export type FloatingSide = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";
/** A side, optionally with an alignment along it; `start` and `end` follow the text direction. */
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${"start" | "end"}`;

export type Box = { x: number; y: number; width: number; height: number };

export type PositionInput = {
  /** The anchor's box in viewport coordinates. */
  anchor: Box;
  /** The floating part's size. */
  floating: { width: number; height: number };
  /** The viewport's size (the layout viewport, without scrollbars). */
  viewport: { width: number; height: number };
  placement: FloatingPlacement;
  /** Gap between the anchor and the floating part, in px. */
  offset: number;
  /** Minimum distance kept from the viewport's edges, in px. */
  padding: number;
  /** The anchor's text direction is right to left. */
  rtl: boolean;
};

export type PositionResult = { x: number; y: number; side: FloatingSide; align: FloatingAlign };

const OPPOSITE: Record<FloatingSide, FloatingSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/** The side and alignment a placement names. */
export function parsePlacement(placement: FloatingPlacement): { side: FloatingSide; align: FloatingAlign } {
  const [side, align = "center"] = placement.split("-") as [FloatingSide, FloatingAlign?];
  return { side, align };
}

function place(side: FloatingSide, align: FloatingAlign, { anchor, floating, offset, rtl }: PositionInput): { x: number; y: number } {
  const vertical = side === "top" || side === "bottom";
  if (vertical) {
    const y = side === "bottom" ? anchor.y + anchor.height + offset : anchor.y - floating.height - offset;
    // In right-to-left text, start is the anchor's right edge.
    const startX = rtl ? anchor.x + anchor.width - floating.width : anchor.x;
    const endX = rtl ? anchor.x : anchor.x + anchor.width - floating.width;
    const x = align === "start" ? startX : align === "end" ? endX : anchor.x + anchor.width / 2 - floating.width / 2;
    return { x, y };
  }
  const x = side === "right" ? anchor.x + anchor.width + offset : anchor.x - floating.width - offset;
  const y = align === "start" ? anchor.y : align === "end" ? anchor.y + anchor.height - floating.height : anchor.y + anchor.height / 2 - floating.height / 2;
  return { x, y };
}

/** How far the floating part crosses the viewport edge on its main axis, in px (0 when it fits). */
function overflow(side: FloatingSide, { x, y }: { x: number; y: number }, { floating, viewport, padding }: PositionInput): number {
  switch (side) {
    case "bottom":
      return Math.max(0, y + floating.height - (viewport.height - padding));
    case "top":
      return Math.max(0, padding - y);
    case "right":
      return Math.max(0, x + floating.width - (viewport.width - padding));
    case "left":
      return Math.max(0, padding - x);
  }
}

const clamp = (value: number, min: number, max: number) => (max < min ? min : Math.min(Math.max(value, min), max));

/**
 * Places the floating part on its side of the anchor; flips to the opposite
 * side when it does not fit and the opposite side has more room; then shifts
 * it along the anchor's edge to keep it `padding` inside the viewport. The main
 * axis is not clamped, so the part never covers its anchor.
 */
export function computePosition(input: PositionInput): PositionResult {
  const { side: wanted, align } = parsePlacement(input.placement);
  let side = wanted;
  let point = place(side, align, input);
  const over = overflow(side, point, input);
  if (over > 0) {
    const flipped = OPPOSITE[side];
    const flippedPoint = place(flipped, align, input);
    if (overflow(flipped, flippedPoint, input) < over) {
      side = flipped;
      point = flippedPoint;
    }
  }
  const { floating, viewport, padding } = input;
  if (side === "top" || side === "bottom") point = { ...point, x: clamp(point.x, padding, viewport.width - padding - floating.width) };
  else point = { ...point, y: clamp(point.y, padding, viewport.height - padding - floating.height) };
  return { x: point.x, y: point.y, side, align };
}
