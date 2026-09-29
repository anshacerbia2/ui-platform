// Normalizer (TDD tokens, "Normalize and resolve" steps 1-2): read the
// canonical Sass token maps through the Sass JavaScript API, without coercing
// keys or units, and flatten each theme/mode into typed records keyed by the
// emitted custom property name.

import path from "node:path";
import * as sass from "sass";

// Map keys are converted to strings inside Sass with "#{$key}", the same
// interpolation the baseline injector used to build variable names. Unquoted
// keys such as `black` are colors in Sass, and the JS API cannot hash color
// keys, so they must not reach JavaScript as map keys.
const STRINGIFY_KEYS = `
@use "sass:map";
@use "sass:meta";
@function -scnx-keys($value) {
  @if meta.type-of($value) != "map" { @return $value; }
  $out: ();
  @each $key, $item in $value { $out: map.set($out, "#{$key}", -scnx-keys($item)); }
  @return $out;
}
`;

function numberUnit(number) {
  if (number.denominatorUnits.size > 0) {
    throw new Error(`compound unit ${number.toString()} has no CSS value`);
  }
  return number.numeratorUnits.toArray().join("");
}

function colorCss(color) {
  const rgb = color.toSpace("rgb");
  const [r, g, b] = rgb.channels.toArray().map((channel) => Math.round(channel * 1000) / 1000);
  const alpha = Math.round(rgb.alpha * 1000) / 1000;
  return alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** Convert a Sass value to a typed token value (see serialize.mjs). */
export function toValue(value) {
  if (value instanceof sass.SassString) return { kind: "string", text: value.text, quoted: value.hasQuotes };
  if (value instanceof sass.SassNumber) return { kind: "number", value: value.value, unit: numberUnit(value) };
  if (value instanceof sass.SassColor) return { kind: "color", css: colorCss(value) };
  if (value instanceof sass.SassBoolean) return { kind: "boolean", value: value.isTruthy };
  if (value === sass.sassNull) return { kind: "null" };
  if (value instanceof sass.SassList || value instanceof sass.SassMap) {
    const items = value.asList.toArray();
    const separator = value.separator === "," ? "," : value.separator === "/" ? "/" : value.separator === " " ? " " : null;
    return { kind: "list", separator, brackets: value.hasBrackets ?? false, items: items.map(toValue) };
  }
  throw new Error(`unsupported Sass value ${value?.constructor?.name}`);
}

/**
 * Flatten one theme map for one mode, mirroring the baseline injector:
 * keys join with "-", and a "light"/"dark" node is entered only for its mode
 * without adding a segment.
 * @returns {{ records: Map<string, import("./serialize.mjs").TokenValue>, duplicates: string[] }}
 */
export function flatten(map, mode, prefix = "ds", records = new Map(), duplicates = []) {
  for (const pair of map.asList) {
    const [key, value] = pair.asList.toArray();
    const name = key.text;
    if (value instanceof sass.SassMap && value.contents.size > 0) {
      if (name === "light" || name === "dark") {
        if (name === mode) flatten(value, mode, prefix, records, duplicates);
      } else {
        flatten(value, mode, `${prefix}-${name}`, records, duplicates);
      }
      continue;
    }
    const cssName = `--${prefix}-${name}`;
    if (records.has(cssName)) duplicates.push(cssName);
    records.set(cssName, toValue(value));
  }
  return { records, duplicates };
}

/**
 * Normalize every configured theme and mode.
 * @param {{ packageDir: string, config: object }} options
 * @returns {{ themes: Record<string, Record<string, { records: Map<string, object>, origin: Map<string, string>, duplicates: string[] }>> }}
 */
export function normalize({ packageDir, config }) {
  const raw = {};
  const uses = [];
  const calls = [];
  let index = 0;
  for (const [themeId, theme] of Object.entries(config.themes)) {
    for (const [mode, source] of Object.entries(theme.modes)) {
      const alias = `m${index++}`;
      uses.push(`@use "${source.module}" as ${alias};`);
      calls.push(`$_${alias}: scnx-export("${themeId}", "${mode}", -scnx-keys(${alias}.$${source.variable}));`);
    }
  }
  const entry = `${uses.join("\n")}\n${STRINGIFY_KEYS}\n${calls.join("\n")}\n`;

  sass.compileString(entry, {
    loadPaths: [path.join(packageDir, config.sourceRoot)],
    logger: sass.Logger.silent,
    functions: {
      "scnx-export($theme, $mode, $map)": ([theme, mode, map]) => {
        const themeId = theme.assertString("theme").text;
        const modeId = mode.assertString("mode").text;
        (raw[themeId] ??= {})[modeId] = flatten(map.assertMap("map"), modeId);
        return sass.sassNull;
      },
    },
  });

  const themes = {};
  const resolve = (themeId, mode) => {
    const theme = config.themes[themeId];
    const own = raw[themeId][mode];
    const records = new Map();
    const origin = new Map();
    if (theme.inherits) {
      const parent = resolve(theme.inherits, mode);
      for (const [name, value] of parent.records) {
        records.set(name, value);
        origin.set(name, parent.origin.get(name));
      }
    }
    for (const [name, value] of own.records) {
      records.set(name, value);
      origin.set(name, themeId);
    }
    return { records, origin, duplicates: own.duplicates };
  };
  for (const [themeId, theme] of Object.entries(config.themes)) {
    themes[themeId] = {};
    for (const mode of Object.keys(theme.modes)) themes[themeId][mode] = resolve(themeId, mode);
  }
  return { themes };
}
