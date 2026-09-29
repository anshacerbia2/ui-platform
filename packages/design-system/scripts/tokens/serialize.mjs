// Property-aware serialization of normalized token values (TDD tokens,
// "Normalize and resolve" step 7). Values are typed ASTs produced by
// normalize.mjs; `meta.inspect` is never used as a CSS serializer.

/** @typedef {{ kind: "string", text: string, quoted: boolean }
 *   | { kind: "number", value: number, unit: string }
 *   | { kind: "color", css: string }
 *   | { kind: "list", separator: "," | " " | "/" | null, brackets: boolean, items: TokenValue[] }
 *   | { kind: "boolean", value: boolean }
 *   | { kind: "null" }} TokenValue */

const SEPARATORS = { ",": ", ", " ": " ", "/": " / " };

/** Format a number the way Sass does: at most 10 decimal places, no exponent. */
export function formatNumber(value) {
  if (!Number.isFinite(value)) throw new Error(`non-finite number ${value}`);
  const rounded = Math.round(value * 1e10) / 1e10;
  const text = rounded.toFixed(10).replace(/\.?0+$/, "");
  return text === "-0" ? "0" : text;
}

/**
 * Serialize one value to CSS text.
 * @param {TokenValue} value
 * @returns {string}
 */
export function toCss(value) {
  switch (value.kind) {
    case "string":
      // Sass interpolation semantics: quotes are removed. A quoted source
      // string holding a whole font stack serializes to that stack.
      return value.text;
    case "number":
      return `${formatNumber(value.value)}${value.unit}`;
    case "color":
      return value.css;
    case "list": {
      if (value.items.length === 0) throw new Error("empty list has no CSS value");
      const parts = value.items.map(toCss);
      // A one-element list serializes as its element, never as "(x,)".
      const joined = parts.length === 1 ? parts[0] : parts.join(SEPARATORS[value.separator ?? " "] ?? " ");
      return value.brackets ? `[${joined}]` : joined;
    }
    case "boolean":
    case "null":
      throw new Error(`${value.kind} has no CSS value`);
    default:
      throw new Error(`unknown value kind ${value.kind}`);
  }
}

/**
 * Reject text that could end the declaration or rule it is emitted into
 * (TDD tokens, Security Notes). Parentheses and quotes must also balance.
 */
export function assertDeclarationSafe(css) {
  let depth = 0;
  let quote = null;
  for (const char of css) {
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === ";" || char === "{" || char === "}" || char === "!") {
      throw new Error(`"${char}" would escape the declaration`);
    }
    if (depth < 0) throw new Error("unbalanced parentheses");
  }
  if (depth !== 0 || quote) throw new Error("unbalanced parentheses or quotes");
}
