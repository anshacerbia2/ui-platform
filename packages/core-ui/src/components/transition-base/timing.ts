/** Added to the computed timing before the fallback settles a transition. */
export const TIMEOUT_SAFETY_MARGIN_MS = 50;
/** No fallback waits longer than this, whatever the computed timing. */
export const TIMEOUT_CAP_MS = 5000;

/** Parse a computed CSS time list ("0.3s, 200ms") into milliseconds; invalid or negative entries are 0. */
export function parseTimeList(value: string | null | undefined): number[] {
  if (!value) return [0];
  return value.split(",").map((entry) => {
    const match = /^\s*(-?\d*\.?\d+)(ms|s)\s*$/.exec(entry);
    if (!match) return 0;
    const ms = Number(match[1]) * (match[2] === "s" ? 1000 : 1);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  });
}

/** The longest duration + delay pair; delays repeat to the length of the durations, as CSS lists do. */
function longest(durations: string, delays: string): number {
  const d = parseTimeList(durations);
  const l = parseTimeList(delays);
  return Math.max(0, ...d.map((duration, index) => duration + (l[index % l.length] ?? 0)));
}

/**
 * Total running time of an element's transitions and animations
 * (TDD theme: max(transition-duration + delay, animation-duration + delay)).
 */
export function computedTiming(style: Pick<CSSStyleDeclaration, "transitionDuration" | "transitionDelay" | "animationDuration" | "animationDelay">): number {
  return Math.max(longest(style.transitionDuration, style.transitionDelay), longest(style.animationDuration, style.animationDelay));
}

/** Bounded completion fallback for a computed running time; 0 means "settle now". */
export function fallbackTimeout(timingMs: number, margin = TIMEOUT_SAFETY_MARGIN_MS, cap = TIMEOUT_CAP_MS): number {
  if (!(timingMs > 0)) return 0;
  return Math.min(timingMs + margin, cap);
}
