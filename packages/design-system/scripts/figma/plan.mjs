// The Figma library plan (ADR-UIP-TKN-004 item 4; TDD tokens FG7-FG10): everything the
// repository's Figma plugin writes, computed here from the emitted package outputs so the
// plugin itself only applies it. Inputs are the Figma profile (tokens/figma/*.tokens.json)
// and the typed records (tokens/json/<theme>.json); nothing is read from a design file.
//
//   node scripts/figma/plan.mjs --dist <package dist> --out <plan.json>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COLOR_COLLECTION = "Scnehaux / Color";
export const DIMENSION_COLLECTION = "Scnehaux / Dimension";
const EXTENSION = "com.scnehaux.ui";

/** FG8 (ADR-UIP-TKN-004 item 4.3): scopes follow the Tier-2 grammar, never words in a name. */
const COLOR_SCOPES = {
  surface: ["FRAME_FILL", "SHAPE_FILL"],
  text: ["TEXT_FILL"],
  icon: ["SHAPE_FILL", "STROKE_COLOR"],
  border: ["STROKE_COLOR"],
  shadow: ["EFFECT_COLOR"],
};
const DIMENSION_SCOPES = {
  spacing: ["GAP"],
  radius: ["CORNER_RADIUS"],
  "border-width": ["STROKE_FLOAT"],
  "z-index": [],
};

export function scopesFor(tokenPath) {
  const [domain, a, b] = tokenPath.split(".");
  const scopes = domain === "color" ? COLOR_SCOPES[b] : domain === "dimension" ? DIMENSION_SCOPES[a] : undefined;
  if (!scopes) throw new Error(`no Figma scope rule for ${tokenPath}`);
  return scopes;
}

/** Leaves of a DTCG document: [{ path, token }] in document order. */
export function dtcgLeaves(node, prefix = []) {
  const out = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$") || !value || typeof value !== "object") continue;
    if ("$value" in value) out.push({ path: [...prefix, key].join("."), token: value });
    else out.push(...dtcgLeaves(value, [...prefix, key]));
  }
  return out;
}

const figmaName = (tokenPath) => tokenPath.replaceAll(".", "/");
const rgba = ({ components, alpha = 1 }) => ({ r: components[0], g: components[1], b: components[2], a: alpha });
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** FG7: one Color collection whose modes are every theme × mode; one Dimension collection with a mode per theme. */
function collections(profiles) {
  const colorModes = [];
  const colorValues = new Map();
  const dimensionModes = [];
  const dimensionValues = new Map();
  const meta = new Map();
  const add = (values, leaves, slot) => {
    for (const { path: tokenPath, token } of leaves) {
      const cssName = token.$extensions[EXTENSION].cssName;
      if (!values.has(tokenPath)) values.set(tokenPath, []);
      values.get(tokenPath)[slot] = token.$type === "color" ? rgba(token.$value) : token.$value;
      meta.set(tokenPath, { type: token.$type === "color" ? "COLOR" : "FLOAT", codeSyntax: token.$extensions[EXTENSION].codeSyntax, cssName });
    }
  };
  for (const { themeId, modes, dimension } of profiles) {
    for (const [mode, doc] of modes) {
      colorModes.push(themeId === "default" ? title(mode) : `${title(themeId)} ${mode}`);
      add(colorValues, dtcgLeaves(doc), colorModes.length - 1);
    }
    dimensionModes.push(title(themeId));
    add(dimensionValues, dtcgLeaves(dimension), dimensionModes.length - 1);
  }
  const variables = (values, count) =>
    [...values].map(([tokenPath, list]) => {
      if (list.length !== count || list.some((v) => v === undefined)) throw new Error(`${tokenPath}: missing from a mode`);
      const { type, codeSyntax, cssName } = meta.get(tokenPath);
      return { name: figmaName(tokenPath), cssName, type, scopes: scopesFor(tokenPath), codeSyntax, values: list };
    });
  return [
    { name: COLOR_COLLECTION, modes: colorModes, variables: variables(colorValues, colorModes.length) },
    { name: DIMENSION_COLLECTION, modes: dimensionModes, variables: variables(dimensionValues, dimensionModes.length) },
  ];
}

/** FG9: a text style per typography composite of the default theme. */
const WEIGHT_STYLE = { 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold" };
// Figma has no system font stack; the mono stack is drawn in Roboto Mono (a Figma default font).
const FAMILY = { Inter: "Inter", "ui-monospace": "Roboto Mono" };
const pixels = (css) => (css.endsWith("rem") ? parseFloat(css) * 16 : parseFloat(css));

export function textStyles(records) {
  const composites = new Map();
  for (const t of records.tokens) {
    const m = /^typography\.([^.]+)\.([^.]+)\.(font-family|font-size|font-weight|line-height|letter-spacing)$/.exec(t.name);
    if (!m) continue;
    const key = `${m[1]}/${m[2]}`;
    if (!composites.has(key)) composites.set(key, { name: key, cssPrefix: t.cssName.replace(/-[a-z]+(-[a-z]+)?$/, "") });
    composites.get(key)[m[3]] = t.resolved[records.theme][records.modes[0]];
  }
  return [...composites.values()].map((c) => {
    const first = c["font-family"].split(",")[0].trim().replace(/^["']|["']$/g, "");
    const fontFamily = FAMILY[first];
    const fontStyle = WEIGHT_STYLE[Number(c["font-weight"])];
    if (!fontFamily || !fontStyle) throw new Error(`typography ${c.name}: no Figma font for ${first} ${c["font-weight"]}`);
    const lh = c["line-height"];
    const lineHeight = /^[\d.]+$/.test(lh) ? { unit: "PERCENT", value: Math.round(Number(lh) * 1e4) / 100 } : { unit: "PIXELS", value: pixels(lh) };
    const ls = c["letter-spacing"];
    const letterSpacing = ls.endsWith("em") ? { unit: "PERCENT", value: Math.round(parseFloat(ls) * 1e4) / 100 } : { unit: "PIXELS", value: pixels(ls) };
    const substitute = fontFamily !== first ? ` Figma substitute for the system stack "${c["font-family"]}".` : "";
    return {
      name: c.name,
      fontFamily,
      fontStyle,
      fontSize: pixels(c["font-size"]),
      lineHeight,
      letterSpacing,
      description: `typography.${c.name.replace("/", ".")} — ${c.cssPrefix}-*.${substitute}`,
    };
  });
}

/** Text styles are shared by every theme; a theme whose typography differs stops the plan. */
export function sharedTextStyles(recordsByTheme) {
  const [first, ...rest] = recordsByTheme.map((records) => textStyles(records));
  for (const [i, styles] of rest.entries()) {
    if (JSON.stringify(styles) !== JSON.stringify(first)) throw new Error(`typography of theme "${recordsByTheme[i + 1].theme}" differs from "${recordsByTheme[0].theme}"`);
  }
  return first;
}

/** Split a CSS list at top-level commas. */
function splitTop(css) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "(") depth++;
    else if (css[i] === ")") depth--;
    else if (css[i] === "," && depth === 0) {
      parts.push(css.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(css.slice(start).trim());
  return parts;
}

/** One shadow layer: "inset? x y blur spread var(--ds-…)" → a Figma effect bound to its color variable. */
export function shadowLayer(css, colorByCss) {
  const m = /^(inset\s+)?(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+var\((--ds-[\w-]+)\)$/.exec(css.trim());
  if (!m) throw new Error(`unsupported shadow layer "${css}"`);
  const color = colorByCss.get(m[6]);
  if (!color) throw new Error(`shadow color ${m[6]} is not a color token`);
  return {
    type: m[1] ? "INNER_SHADOW" : "DROP_SHADOW",
    offset: { x: Number(m[2]), y: Number(m[3]) },
    radius: Number(m[4]),
    spread: Number(m[5] ?? 0),
    color: color.values[0],
    colorVariable: color.name,
  };
}

/**
 * FG10: an effect style per theme and shadow token, its colors bound to variables so it
 * follows the frame's mode. A token whose layers differ between modes (dark floating
 * materials add a lit edge) gets one style per mode, named with the mode. Themes may
 * differ in geometry, so each theme has its own styles.
 */
export function effectStyles(recordsByTheme, colorVariables) {
  const colorByCss = new Map(colorVariables.map((v) => [v.cssName, v]));
  const styles = [];
  for (const records of recordsByTheme) {
    for (const t of records.tokens.filter((x) => x.type === "shadow" && x.tier === 2).sort((a, b) => a.name.localeCompare(b.name))) {
      const byMode = records.modes.map((mode) => [mode, t.themes[records.theme][mode]]);
      const shared = byMode.every(([, css]) => css === byMode[0][1]);
      const path = t.name.replace(/^effect\./, "").replaceAll(".", "/");
      for (const [mode, css] of shared ? [byMode[0]] : byMode) {
        styles.push({
          name: shared ? `${title(records.theme)}/${path}` : `${title(records.theme)}/${title(mode)}/${path}`,
          description: `${t.name} in theme "${records.theme}"${shared ? "" : `, ${mode} mode`} — var(${t.cssName}). Colors are bound to variables, so the style follows the frame's mode.`,
          effects: splitTop(css).map((layer) => shadowLayer(layer, colorByCss)),
        });
      }
    }
  }
  return styles;
}

/** The whole plan from a package dist directory. */
export function buildPlan(distDir, { source } = {}) {
  const config = (file) => JSON.parse(fs.readFileSync(path.join(distDir, file), "utf8"));
  const themeIds = ["default", ...fs.readdirSync(path.join(distDir, "tokens/json")).map((f) => f.replace(/\.json$/, "")).filter((t) => t !== "default").sort()];
  const recordsByTheme = themeIds.map((t) => config(`tokens/json/${t}.json`));
  const profiles = recordsByTheme.map((records) => ({
    themeId: records.theme,
    modes: records.modes.map((mode) => [mode, config(`tokens/figma/${records.theme}.${mode}.color.tokens.json`)]),
    dimension: config(`tokens/figma/${records.theme}.dimension.tokens.json`),
  }));
  const cols = collections(profiles);
  const manifest = path.join(distDir, "../package.json");
  const pkg = source ? null : JSON.parse(fs.readFileSync(manifest, "utf8"));
  return {
    schemaVersion: 1,
    source: source ?? `${pkg.name}@${pkg.version}`,
    collections: cols,
    textStyles: sharedTextStyles(recordsByTheme),
    effectStyles: effectStyles(recordsByTheme, cols[0].variables),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (flag) => process.argv[process.argv.indexOf(flag) + 1];
  const plan = buildPlan(path.resolve(arg("--dist")));
  fs.mkdirSync(path.dirname(path.resolve(arg("--out"))), { recursive: true });
  fs.writeFileSync(path.resolve(arg("--out")), `${JSON.stringify(plan)}\n`);
  console.log(`${plan.source}: ${plan.collections.map((c) => `${c.name} ${c.variables.length} × ${c.modes.length}`).join(", ")}, ${plan.textStyles.length} text styles, ${plan.effectStyles.length} effect styles`);
}
