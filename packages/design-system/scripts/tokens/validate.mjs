// Contract validator (TDD tokens, "Normalize and resolve" steps 3-6 and
// "CSS and visual validation"). Produces findings in the six categories of the
// PLAN P0 row 4 gate: grammar, reference, property-value, key-set, font, and
// contrast (WCAG 2.2 SC 1.4.3 / 1.4.11).

import fs from "node:fs";
import path from "node:path";
import * as csstree from "css-tree";
import { COLOR, DIMENSION, MOTION, TYPOGRAPHY, consumingProperty, parseTokenName, tokenType } from "./grammar.mjs";
import { contrastRatio, inSrgbGamut, parseColor } from "./color.mjs";
import { assertDeclarationSafe, toCss } from "./serialize.mjs";

export const CATEGORIES = ["grammar", "reference", "property-value", "key-set", "font", "contrast"];

const GENERIC_FAMILIES = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui",
  "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "math", "emoji", "fangsong",
]);

/** Find each var() in `css`: { start, end, name, fallback }. */
export function findVars(css) {
  const found = [];
  let from = 0;
  for (;;) {
    const start = css.indexOf("var(", from);
    if (start === -1) return found;
    let depth = 0;
    let end = start + 3;
    for (; end < css.length; end++) {
      if (css[end] === "(") depth++;
      else if (css[end] === ")" && --depth === 0) break;
    }
    const inner = css.slice(start + 4, end);
    const comma = inner.indexOf(",");
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? null : inner.slice(comma + 1).trim();
    found.push({ start, end: end + 1, name, fallback });
    from = end + 1;
  }
}

/**
 * Substitute var() references recursively.
 * @param {string} css
 * @param {(name: string) => string | undefined} lookup serialized value by name
 * @returns {{ value: string, missing: { name: string, chain: string[] }[], cycles: string[][] }}
 */
export function substitute(css, lookup, chain = []) {
  const missing = [];
  const cycles = [];
  let out = "";
  let last = 0;
  for (const ref of findVars(css)) {
    out += css.slice(last, ref.start);
    last = ref.end;
    if (chain.includes(ref.name)) {
      cycles.push([...chain, ref.name]);
      out += ref.fallback ?? "";
      continue;
    }
    const target = lookup(ref.name);
    if (target === undefined) {
      missing.push({ name: ref.name, chain: [...chain, ref.name] });
      if (ref.fallback !== null) {
        const inner = substitute(ref.fallback, lookup, chain);
        missing.push(...inner.missing);
        cycles.push(...inner.cycles);
        out += inner.value;
      }
      continue;
    }
    const inner = substitute(target, lookup, [...chain, ref.name]);
    missing.push(...inner.missing);
    cycles.push(...inner.cycles);
    out += inner.value;
  }
  return { value: out + css.slice(last), missing, cycles };
}

/** Whether `value` is valid for `property` according to the CSS grammar. */
export function validForProperty(property, value) {
  try {
    const ast = csstree.parse(value, { context: "value" });
    const result = csstree.lexer.matchProperty(property, ast);
    return result.error ? result.error.message.split("\n")[0] : null;
  } catch (error) {
    return error.message.split("\n")[0];
  }
}

/** Families of a resolved font-family value, unquoted. */
export function fontFamilies(value) {
  return value
    .split(",")
    .map((family) => family.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/** Tokens missing from, or typed differently in, a theme/mode compared with the union. */
export function keySetFindings(themes, aliases) {
  const findings = [];
  const union = new Map();
  for (const modes of Object.values(themes)) {
    for (const { records } of Object.values(modes)) {
      for (const name of records.keys()) union.set(name, tokenType(name, aliases));
    }
  }
  for (const [themeId, modes] of Object.entries(themes)) {
    for (const [mode, { records }] of Object.entries(modes)) {
      for (const name of union.keys()) {
        if (!records.has(name)) {
          findings.push({ category: "key-set", theme: themeId, mode, token: name, message: "missing; every theme/mode must expose the same public key set" });
        }
      }
    }
  }
  return findings;
}

/**
 * Contrast cases required by STD-UIP-TKN-001 "Semantic Usage Doctrine":
 * - every text/icon `contrast` token on the `solid` surface of its scheme, per state;
 * - every text/icon `subtle|default|strong` token on the declared neutral surfaces;
 * - every border `focus` token on the declared neutral surfaces, because it
 *   draws the focus indicator (STD-GLB-FE-005 section 3.9, SC 1.4.11).
 * Disabled states are exempt from SC 1.4.3 and 1.4.11 and are not evaluated.
 */
export function contrastCases(names, config) {
  const cases = [];
  const has = (name) => names.has(name);
  const minimum = (role) => (role === "text" ? config.contrast.textMinimum : config.contrast.nonTextMinimum);
  for (const scheme of COLOR.schemes) {
    for (const role of ["text", "icon"]) {
      // contrast-on-solid: pair foreground state with the surface state it sits on
      const onSolid = [
        ["default", "default"],
        ["default", "pressed"],
        ["default", "selected"],
        ["hover", "hover"],
      ];
      for (const [fgState, bgState] of onSolid) {
        const fg = `--ds-color-${scheme}-${role}-contrast-${fgState}`;
        const bg = `--ds-color-${scheme}-surface-solid-${bgState}`;
        if (has(fg) || has(bg)) cases.push({ rule: "contrast-on-solid", fg, bg, minimum: minimum(role) });
      }
      for (const emphasis of ["subtle", "default", "strong"]) {
        for (const state of ["default", "hover"]) {
          const fg = `--ds-color-${scheme}-${role}-${emphasis}-${state}`;
          if (!has(fg)) continue;
          for (const bg of config.contrast.neutralBackgrounds) {
            cases.push({ rule: "on-neutral-surface", fg, bg, minimum: minimum(role) });
          }
        }
      }
    }
    for (const emphasis of ["subtle", "default", "strong"]) {
      const fg = `--ds-color-${scheme}-border-${emphasis}-focus`;
      if (!has(fg)) continue;
      for (const bg of config.contrast.neutralBackgrounds) {
        cases.push({ rule: "focus-on-neutral-surface", fg, bg, minimum: config.contrast.nonTextMinimum });
      }
    }
  }
  return cases;
}

/** Remove CSS/Sass/TS comments so commented-out references are not callsites. */
export function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1");
}

/**
 * Source callsites that reference a --ds-* token no theme emits
 * (TKN-005: every reference resolves, including consumer references).
 * @param {string[]} files absolute paths
 * @param {Set<string>} emitted every emitted token name
 */
export function callsiteFindings(files, emitted, packageDir) {
  const findings = [];
  for (const file of files) {
    const lines = stripComments(fs.readFileSync(file, "utf8")).split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const [name] of line.matchAll(/--ds-[\w-]+/g)) {
        if (emitted.has(name)) continue;
        findings.push({
          category: "reference",
          token: name,
          message: `source callsite references an undefined token`,
          callsite: `${path.relative(packageDir, file).replaceAll("\\", "/")}:${index + 1}`,
        });
      }
    });
  }
  return findings;
}

/** A resolved length, duration, or plain number in comparable base units. */
export function measure(value) {
  const match = /^(-?\d*\.?\d+)(rem|px|ms|s)?$/.exec(value.trim());
  if (!match) return null;
  const number = Number(match[1]);
  const scale = { rem: 16, px: 1, ms: 1, s: 1000 }[match[2]] ?? 1;
  const unit = { rem: "px", px: "px", ms: "ms", s: "ms" }[match[2]] ?? "";
  return { value: number * scale, unit };
}

/**
 * Direction of a cubic-bezier easing: "decelerating" when both control points
 * lie on or above the diagonal (progress leads time, as in ease-out),
 * "accelerating" when both lie on or below it (as in ease-in), otherwise null.
 */
export function easingDirection(value) {
  const keywords = { "ease-in": "accelerating", "ease-out": "decelerating" };
  if (keywords[value.trim()]) return keywords[value.trim()];
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim());
  if (!match) return null;
  const [x1, y1, x2, y2] = match[1].split(",").map(Number);
  if ([x1, y1, x2, y2].some(Number.isNaN) || (x1 === y1 && x2 === y2)) return null;
  if (y1 >= x1 && y2 >= x2) return "decelerating";
  if (y1 <= x1 && y2 <= x2) return "accelerating";
  return null;
}

/**
 * Value relationships the standard requires of every theme and mode
 * (STD-UIP-TKN-001 section 3): spacing relationships ascend from compact to
 * comfortable, z-index layers strictly ascend, heading sizes descend, weights
 * ascend, enter decelerates and exit accelerates, exit is no longer than
 * enter, and feedback is the shortest duration.
 * @param {Map<string, string>} resolved resolved CSS value by name
 * @returns {{ token: string, message: string }[]}
 */
export function orderFindings(resolved) {
  const findings = [];
  const read = (name) => (resolved.has(name) ? measure(resolved.get(name)) : null);
  const sequence = (names, direction, rule) => {
    const present = names.filter((name) => resolved.has(name));
    for (let i = 1; i < present.length; i++) {
      const [a, b] = [read(present[i - 1]), read(present[i])];
      if (!a || !b || a.unit !== b.unit) {
        findings.push({ token: present[i], message: `${rule}: cannot compare with ${present[i - 1]}` });
      } else if (direction === "ascend" ? !(b.value > a.value) : !(b.value < a.value)) {
        findings.push({ token: present[i], message: `${rule}: ${resolved.get(present[i])} does not ${direction} from ${present[i - 1]} (${resolved.get(present[i - 1])})` });
      }
    }
  };

  for (const relationship of ["inset", "stack", "inline"]) {
    const names = ["compact", "default", "comfortable"].map((d) => `--ds-dimension-spacing-${relationship}-${d}`);
    sequence(names, "ascend", `spacing ${relationship} ascends compact -> comfortable`);
  }
  sequence(DIMENSION["z-index"].map((i) => `--ds-dimension-z-index-${i}`), "ascend", "z-index strictly ascends");
  sequence(TYPOGRAPHY.composites.heading.map((v) => `--ds-typography-heading-${v}-font-size`), "descend", "heading sizes descend");
  sequence(TYPOGRAPHY.weight.map((w) => `--ds-typography-weight-${w}`), "ascend", "weights ascend");

  for (const [action, expected] of [["enter", "decelerating"], ["exit", "accelerating"]]) {
    const name = `--ds-motion-${action}-easing`;
    if (resolved.has(name) && easingDirection(resolved.get(name)) !== expected) {
      findings.push({ token: name, message: `motion.${action}.easing must be ${expected}: ${resolved.get(name)}` });
    }
  }
  const duration = (action) => read(`--ds-motion-${action}-duration`);
  const [enter, exit] = [duration("enter"), duration("exit")];
  if (enter && exit && exit.value > enter.value) {
    findings.push({ token: "--ds-motion-exit-duration", message: "motion.exit.duration exceeds motion.enter.duration" });
  }
  const feedback = duration("feedback");
  if (feedback) {
    for (const action of MOTION.actions.filter((a) => a !== "feedback")) {
      const other = duration(action);
      if (other && !(feedback.value < other.value)) {
        findings.push({ token: "--ds-motion-feedback-duration", message: `motion.feedback.duration is not shorter than motion.${action}.duration` });
      }
    }
  }
  return findings;
}

/**
 * Validate normalized themes.
 * @returns {{ findings: object[], stats: object }}
 */
export function validate({ themes, config, packageDir }) {
  const aliases = config.aliases ?? {};
  const findings = [];
  const add = (finding) => findings.push(finding);
  const stats = { outOfGamut: new Set(), contrastCases: 0, contrastFailures: 0, unresolved: 0 };

  // Grammar: once per name, listing where it appears.
  const where = new Map();
  for (const [themeId, modes] of Object.entries(themes)) {
    for (const [mode, { records, duplicates }] of Object.entries(modes)) {
      for (const name of records.keys()) {
        if (!where.has(name)) where.set(name, []);
        where.get(name).push(`${themeId}/${mode}`);
      }
      for (const name of duplicates) {
        add({ category: "grammar", theme: themeId, mode, token: name, message: "duplicate CSS name from two source paths" });
      }
    }
  }
  for (const [name, places] of where) {
    const parsed = parseTokenName(name, aliases);
    if (!parsed.valid) add({ category: "grammar", token: name, message: parsed.error, where: places });
  }

  findings.push(...keySetFindings(themes, aliases));

  for (const [themeId, modes] of Object.entries(themes)) {
    for (const [mode, { records }] of Object.entries(modes)) {
      const serialized = new Map();
      for (const [name, value] of records) {
        try {
          const css = toCss(value);
          assertDeclarationSafe(css);
          serialized.set(name, css);
        } catch (error) {
          add({ category: "property-value", theme: themeId, mode, token: name, message: `not serializable: ${error.message}` });
        }
      }
      const lookup = (name) => serialized.get(name);
      const resolved = new Map();

      for (const [name, css] of serialized) {
        const { value, missing, cycles } = substitute(css, lookup);
        resolved.set(name, value);
        for (const miss of missing) {
          stats.unresolved++;
          add({ category: "reference", theme: themeId, mode, token: name, message: `undefined reference ${miss.name}`, chain: [name, ...miss.chain] });
        }
        for (const cycle of cycles) {
          add({ category: "reference", theme: themeId, mode, token: name, message: `reference cycle ${[name, ...cycle].join(" -> ")}` });
        }

        const type = tokenType(name, aliases);
        if (!type) {
          add({ category: "property-value", theme: themeId, mode, token: name, message: "no legal token type (TDD tokens TokenRecord.type)" });
          continue;
        }
        const property = consumingProperty(name, type, aliases);
        const invalid = missing.length === 0 && property ? validForProperty(property, value) : null;
        if (invalid) {
          add({ category: "property-value", theme: themeId, mode, token: name, message: `"${value}" is not a valid ${property}: ${invalid}` });
        }
        if (type === "color") {
          const color = parseColor(value);
          if (color && !inSrgbGamut(color)) stats.outOfGamut.add(name);
        }
        if (type === "fontFamily" && missing.length === 0) {
          for (const family of fontFamilies(value)) {
            if (GENERIC_FAMILIES.has(family) || config.fonts.system.includes(family)) continue;
            const asset = config.fonts.assets[family];
            if (!asset) {
              add({ category: "font", theme: themeId, mode, token: name, message: `family "${family}" is neither a declared asset, a declared system font, nor generic` });
              continue;
            }
            for (const file of [...asset.faces.map((face) => face.source), asset.license.source]) {
              if (!fs.existsSync(path.join(packageDir, file))) {
                add({ category: "font", theme: themeId, mode, token: name, message: `asset file ${file} for "${family}" is missing` });
              }
            }
          }
        }
        if (type === "fontFamily" && missing.length > 0) {
          add({ category: "font", theme: themeId, mode, token: name, message: "font stack does not resolve (see reference findings)" });
        }
      }

      for (const finding of orderFindings(resolved)) {
        add({ category: "property-value", theme: themeId, mode, ...finding });
      }

      const canvas = parseColor(resolved.get(config.contrast.canvas) ?? "");
      for (const test of contrastCases(new Set(resolved.keys()), config)) {
        stats.contrastCases++;
        const fg = parseColor(resolved.get(test.fg) ?? "");
        const bg = parseColor(resolved.get(test.bg) ?? "");
        if (!fg || !bg || !canvas) {
          stats.contrastFailures++;
          const absent = [!fg && test.fg, !bg && test.bg, !canvas && config.contrast.canvas].filter(Boolean);
          add({ category: "contrast", theme: themeId, mode, token: test.fg, message: `${test.rule}: cannot evaluate; unresolved ${absent.join(", ")}` });
          continue;
        }
        const ratio = contrastRatio(fg, bg, canvas);
        if (ratio < test.minimum) {
          stats.contrastFailures++;
          add({
            category: "contrast", theme: themeId, mode, token: test.fg,
            message: `${test.rule}: ${ratio.toFixed(2)}:1 on ${test.bg} (minimum ${test.minimum}:1)`,
          });
        }
      }
    }
  }

  return { findings, stats: { ...stats, outOfGamut: stats.outOfGamut.size } };
}
