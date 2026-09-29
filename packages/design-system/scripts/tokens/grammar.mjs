// Canonical token grammar, transcribed from STD-UIP-TKN-001 v2.0.0 section 3
// (scnehaux-architecture cf748f6). The standard is the single normative
// definition; change this file only to follow a ratified revision of it.
//
// Domains whose Tier-2 vocabulary the standard does not yet define are `null`:
// every name in them fails the grammar gate until the vocabulary is ratified.

export const STANDARD = { id: "STD-UIP-TKN-001", version: "2.0.0", commit: "cf748f6" };

const SURFACE_STATES = ["default", "hover", "pressed", "selected", "disabled"];

export const COLOR = {
  schemes: ["primary", "neutral", "info", "success", "warning", "danger"],
  roles: ["surface", "border", "text", "icon", "shadow"],
  states: ["default", "hover", "pressed", "selected", "focus", "disabled"],
  neutralOnlyEmphasis: ["canvas", "sunken", "raised", "floating"],
  // Role × Emphasis compatibility
  roleEmphasis: {
    surface: ["subtle", "default", "strong", "solid", "canvas", "sunken", "raised", "floating"],
    border: ["subtle", "default", "strong"],
    text: ["subtle", "default", "strong", "contrast"],
    icon: ["subtle", "default", "strong", "contrast"],
    shadow: ["subtle", "default", "strong", "contrast"],
  },
  // State compatibility invariant
  roleStates: {
    surface: SURFACE_STATES,
    border: ["default", "selected", "focus", "disabled"],
    text: ["default", "hover", "disabled"],
    icon: ["default", "hover", "disabled"],
    shadow: ["default", "hover", "pressed"],
  },
};

export const EFFECT_SHADOWS = ["low", "medium", "high", "overlay", "focus"];

export const MOTION = { actions: ["enter", "exit", "attention", "disclosure"], properties: ["duration", "easing"] };

export const DIMENSION = null;
export const TYPOGRAPHY = null;

const PENDING = (domain) =>
  `Tier-2 ${domain} vocabulary is not defined by ${STANDARD.id} ${STANDARD.version}; pending a ratified revision`;

/**
 * Parse an emitted custom property name against the canonical grammar.
 * @param {string} cssName e.g. "--ds-color-primary-surface-solid-default"
 * @param {Record<string, object>} aliases Tier-3 alias review records keyed by CSS name
 * @returns {{ valid: boolean, tier?: 2 | 3, type?: string, path?: string, error?: string }}
 */
export function parseTokenName(cssName, aliases = {}) {
  if (!cssName.startsWith("--ds-")) return { valid: false, error: "does not start with --ds-" };
  const rest = cssName.slice("--ds-".length);
  const parts = rest.split("-");

  if (aliases[cssName]) {
    return { valid: true, tier: 3, type: aliases[cssName].type, path: aliases[cssName].path };
  }

  if (parts[0] === "color") {
    if (parts.length !== 5) return { valid: false, error: "color names are color.{scheme}.{role}.{emphasis}.{state}" };
    const [, scheme, role, emphasis, state] = parts;
    if (!COLOR.schemes.includes(scheme)) return { valid: false, error: `unknown scheme "${scheme}"` };
    if (!COLOR.roles.includes(role)) return { valid: false, error: `unknown role "${role}"` };
    if (!COLOR.roleEmphasis[role].includes(emphasis)) {
      return { valid: false, error: `emphasis "${emphasis}" is not allowed for role "${role}"` };
    }
    if (COLOR.neutralOnlyEmphasis.includes(emphasis) && scheme !== "neutral") {
      return { valid: false, error: `emphasis "${emphasis}" is neutral-only` };
    }
    if (!COLOR.states.includes(state)) return { valid: false, error: `unknown state "${state}"` };
    if (!COLOR.roleStates[role].includes(state)) {
      return { valid: false, error: `state "${state}" is not allowed for role "${role}"` };
    }
    return { valid: true, tier: 2, type: "color", path: parts.join(".") };
  }

  if (parts[0] === "effect") {
    if (parts.length === 3 && parts[1] === "shadow" && EFFECT_SHADOWS.includes(parts[2])) {
      return { valid: true, tier: 2, type: "shadow", path: parts.join(".") };
    }
    return { valid: false, error: `effect names are effect.shadow.{${EFFECT_SHADOWS.join("|")}}` };
  }

  if (parts[0] === "motion") {
    const [, action, property] = parts;
    if (parts.length === 3 && MOTION.actions.includes(action) && MOTION.properties.includes(property)) {
      return { valid: true, tier: 2, type: property === "duration" ? "duration" : "cubicBezier", path: parts.join(".") };
    }
    return { valid: false, error: `motion names are motion.{${MOTION.actions.join("|")}}.{duration|easing}` };
  }

  if (parts[0] === "dimension") return { valid: false, error: PENDING("dimension") };
  if (parts[0] === "typography") return { valid: false, error: PENDING("typography") };

  return { valid: false, error: "not a canonical Tier-2 name and no Tier-3 alias review record" };
}

// Types of the pre-canonical baseline names, used so that value, reference, and
// font checks still run while names are migrated. Order matters: first match.
const LEGACY_TYPES = [
  [/^--ds-color-/, "color"],
  [/^--ds-shadow-/, "shadow"],
  [/^--ds-duration-/, "duration"],
  [/^--ds-easing-/, "cubicBezier"],
  [/^--ds-font-family-/, "fontFamily"],
  [/^--ds-font-weight-/, "fontWeight"],
  [/^--ds-(line-height|opacity|z)-/, "number"],
  [/^--ds-(font-size|letter-spacing|spacing|size|radius|stroke|layout|breakpoint|container)-/, "dimension"],
];

/** Token type from the canonical grammar, or from the baseline name when non-canonical. */
export function tokenType(cssName, aliases = {}) {
  const parsed = parseTokenName(cssName, aliases);
  if (parsed.valid) return parsed.type;
  if (/^--ds-dimension-z-index-/.test(cssName)) return "number";
  if (/^--ds-dimension-/.test(cssName)) return "dimension";
  return LEGACY_TYPES.find(([pattern]) => pattern.test(cssName))?.[1] ?? null;
}

// Representative consuming property for value validation, by name then type.
const PROPERTY_BY_NAME = [
  [/-(opacity)-/, "opacity"],
  [/-(z|z-index)-/, "z-index"],
  [/-line-height-/, "line-height"],
  [/-letter-spacing-/, "letter-spacing"],
  [/-font-size-/, "font-size"],
  [/-radius-/, "border-radius"],
  [/-stroke-/, "border-width"],
  [/-spacing-/, "margin"],
];
const PROPERTY_BY_TYPE = {
  color: "color",
  shadow: "box-shadow",
  duration: "transition-duration",
  cubicBezier: "transition-timing-function",
  fontFamily: "font-family",
  fontWeight: "font-weight",
  number: "opacity",
  dimension: "width",
  strokeStyle: "border-style",
};

export function consumingProperty(cssName, type) {
  return PROPERTY_BY_NAME.find(([pattern]) => pattern.test(cssName))?.[1] ?? PROPERTY_BY_TYPE[type] ?? null;
}
